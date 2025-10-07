import React, { useState, useEffect, useMemo } from 'react';
import { Table, Alert, Spin, Select, Input, Button, Typography, DatePicker, Tag } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'moment-timezone';
import { api } from '../../../service/api';
import './Monitoramento.css';

const { RangePicker } = DatePicker;
const { Title } = Typography;
const { Option } = Select;

const Monitoramento = () => {
  const [lotes, setLotes] = useState([]);
  const [artigos, setArtigos] = useState([]);
  const [filteredLotes, setFilteredLotes] = useState([]);
  const [filteredArtigos, setFilteredArtigos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const expirationThresholds = [
    { label: '1 Ano', days: 365 },
    { label: '9 Meses', days: 270 },
    { label: '6 Meses', days: 180 },
    { label: '3 Meses', days: 90 },
    { label: '1 Mês', days: 30 },
    { label: '3 Semanas', days: 21 },
    { label: '2 Semanas', days: 14 },
    { label: '1 Semana', days: 7 },
    { label: '5 Dias', days: 5 },
  ];

  // Buscar dados do backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [lotesRes, artigosRes] = await Promise.all([
          api.get('/lotes/all'),
          api.get('/producttype/all'),
        ]);
        setLotes(lotesRes.data);
        setArtigos(artigosRes.data);
        setFilteredLotes(lotesRes.data);
        setFilteredArtigos(artigosRes.data);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar dados: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calcular lotes próximos do vencimento
  const expiringLotes = useMemo(() => {
    const now = moment().tz('Africa/Luanda').startOf('day');
    return lotes
      .map((lote) => {
        const vencimento = moment(lote.dataVencimento).tz('Africa/Luanda').startOf('day');
        const diasRestantes = vencimento.diff(now, 'days');
        const threshold = expirationThresholds.find(
          (t) => diasRestantes <= t.days && diasRestantes > (expirationThresholds[expirationThresholds.indexOf(t) + 1]?.days || 0)
        );
        return { ...lote, diasRestantes, threshold: threshold?.label };
      })
      .filter((lote) => lote.diasRestantes >= 0 && lote.threshold);
  }, [lotes]);

  // Filtrar dados com base nos inputs
  useEffect(() => {
    filterData();
  }, [lotes, artigos, searchTerm, statusFilter, dateRange]);

  const filterData = () => {
    let filteredLotes = lotes;
    if (searchTerm) {
      filteredLotes = filteredLotes.filter(
        (lote) =>
          lote.designacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          artigos.some(
            (artigo) =>
              artigo.nome?.toLowerCase().includes(searchTerm.toLowerCase()) &&
              lote.artigoId === artigo.id
          )
      );
    }
    if (statusFilter) {
      filteredLotes = filteredLotes.filter((lote) => lote.status === (statusFilter === 'ativo'));
    }
    if (dateRange[0] && dateRange[1]) {
      filteredLotes = filteredLotes.filter((lote) => {
        const vencimento = moment(lote.dataVencimento).tz('Africa/Luanda');
        return vencimento.isBetween(dateRange[0], dateRange[1], 'day', '[]');
      });
    }
    setFilteredLotes(filteredLotes);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter(null);
    setDateRange([null, null]);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Designação',
      dataIndex: 'designacao',
      key: 'designacao',
    },
    {
      title: 'Artigo',
      key: 'artigo',
      render: (_, record) => {
        const artigo = artigos.find((a) => a.id === record.artigoId);
        return artigo ? artigo.nome : 'N/A';
      },
    },
    {
      title: 'Data de Vencimento',
      dataIndex: 'dataVencimento',
      key: 'dataVencimento',
      render: (date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status ? 'green' : 'red'}>
          {status ? 'Ativo' : 'Inativo'}
        </Tag>
      ),
    },
    {
      title: 'Dias Restantes',
      key: 'diasRestantes',
      render: (_, record) => {
        const vencimento = moment(record.dataVencimento).tz('Africa/Luanda');
        const diasRestantes = vencimento.diff(moment().tz('Africa/Luanda'), 'days');
        return (
          <Tag color={diasRestantes <= 30 ? 'red' : diasRestantes <= 90 ? 'orange' : 'green'}>
            {diasRestantes} dias
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="monitoramento-container">
      <Title level={3}>Monitoramento de Stock</Title>
      
      {error && (
        <Alert
          message="Erro"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <Input
            placeholder="Buscar por designação ou artigo"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filtrar por status"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="ativo">Ativo</Option>
            <Option value="inativo">Inativo</Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder={['Data início', 'Data fim']}
          />
          <Button icon={<FilterOutlined />} onClick={clearFilters}>
            Limpar Filtros
          </Button>
        </div>
      </div>

      <Spin spinning={loading}>
        <div style={{ marginBottom: 24 }}>
          <Title level={4}>Lotes Próximos do Vencimento</Title>
          <Table
            columns={columns}
            dataSource={expiringLotes}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </div>

        <div>
          <Title level={4}>Todos os Lotes</Title>
          <Table
            columns={columns}
            dataSource={filteredLotes}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </div>
      </Spin>
    </div>
  );
};

export default Monitoramento;