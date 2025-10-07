import React, { useEffect, useState } from 'react';
import { Button, Table, Row, Col, Card, Spin, DatePicker, Select, Statistic, message, Typography, Space } from 'antd';
import { DownloadOutlined, FileExcelOutlined, ReloadOutlined } from '@ant-design/icons';
import { Bar, Pie, Line } from '@ant-design/plots';
import { api } from '../../service/api';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

const RelatoriosTesouraria = () => {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [periodo, setPeriodo] = useState([moment().startOf('month'), moment().endOf('month')]);
  const [tipo, setTipo] = useState('todos');

  useEffect(() => {
    fetchRelatorios();
    // eslint-disable-next-line
  }, [periodo, tipo]);

  const fetchRelatorios = async () => {
    setLoading(true);
    try {
      // Endpoint real se existir, senão mock
      const params = {
        inicio: periodo[0].format('YYYY-MM-DD'),
        fim: periodo[1].format('YYYY-MM-DD'),
        tipo: tipo !== 'todos' ? tipo : undefined
      };
      let res;
      try {
        res = await api.get('/tesouraria/relatorios', { params });
      } catch {
        // fallback mock
        res = { data: [
          { id: 1, tipo: 'Entradas', periodo: '2024-06', valor: 50000 },
          { id: 2, tipo: 'Saídas', periodo: '2024-06', valor: 30000 },
          { id: 3, tipo: 'Saldo', periodo: '2024-06', valor: 20000 },
          { id: 4, tipo: 'Entradas', periodo: '2024-05', valor: 40000 },
          { id: 5, tipo: 'Saídas', periodo: '2024-05', valor: 25000 },
          { id: 6, tipo: 'Saldo', periodo: '2024-05', valor: 15000 },
        ]};
      }
      setRelatorios(res.data || []);
    } catch (e) {
      message.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  // KPIs
  const totalEntradas = relatorios.filter(r => r.tipo === 'Entradas').reduce((a, b) => a + b.valor, 0);
  const totalSaidas = relatorios.filter(r => r.tipo === 'Saídas').reduce((a, b) => a + b.valor, 0);
  const saldo = totalEntradas - totalSaidas;

  // Filtros
  const handlePeriodo = (dates) => {
    if (dates && dates.length === 2) setPeriodo(dates);
  };
  const handleTipo = (value) => setTipo(value);

  // Dados para gráficos
  const barData = relatorios.filter(r => tipo === 'todos' || r.tipo === tipo);
  const pieData = [
    { type: 'Entradas', value: totalEntradas },
    { type: 'Saídas', value: totalSaidas }
  ].filter(d => d.value > 0); // Pie não renderiza se todos valores forem zero
  const lineData = relatorios
    .filter(r => r.tipo === 'Saldo')
    .map(r => ({ periodo: r.periodo, saldo: r.valor }));

  const barConfig = {
    data: barData,
    xField: 'periodo',
    yField: 'valor',
    seriesField: 'tipo',
    isGroup: true,
    color: ({ tipo }) => tipo === 'Entradas' ? '#3f8600' : tipo === 'Saídas' ? '#cf1322' : '#1890ff',
    label: { position: 'top', style: { fill: '#000' } },
    height: 300,
    autoFit: true,
  };
  const pieConfig = {
    appendPadding: 10,
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'spider',
      content: (data) => `${data.type}: ${(data.percent * 100).toFixed(1)}%`,
    },
    interactions: [{ type: 'element-active' }],
    legend: { position: 'bottom' },
    tooltip: { showTitle: false, showMarkers: true },
  };
  const lineConfig = {
    data: lineData,
    xField: 'periodo',
    yField: 'saldo',
    label: {},
    point: { size: 5, shape: 'diamond' },
    color: '#1890ff',
    height: 300,
    autoFit: true,
  };

  const colunasRelatorios = [
    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo' },
    { title: 'Período', dataIndex: 'periodo', key: 'periodo' },
    { title: 'Valor (Kz)', dataIndex: 'valor', key: 'valor', render: v => v.toLocaleString() },
  ];

  // Exportação mock
  const exportar = (tipo) => {
    message.info(`Exportação ${tipo} mockada!`);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <Title level={2} style={{ marginBottom: 0 }}>Relatórios Financeiros</Title>
      <Row gutter={24} align="middle" style={{ marginBottom: 24 }}>
        <Col xs={24} md={16}>
          <Card bordered={false} style={{ background: '#f6f9fb', marginBottom: 8 }}>
            <Row gutter={16}>
              <Col xs={24} sm={8}><Statistic title="Entradas (Kz)" value={totalEntradas} valueStyle={{ color: '#3f8600' }} /></Col>
              <Col xs={24} sm={8}><Statistic title="Saídas (Kz)" value={totalSaidas} valueStyle={{ color: '#cf1322' }} /></Col>
              <Col xs={24} sm={8}><Statistic title="Saldo Atual (Kz)" value={saldo} valueStyle={{ color: saldo >= 0 ? '#3f8600' : '#cf1322' }} /></Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ background: '#f6f9fb', marginBottom: 8 }}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <RangePicker value={periodo} onChange={handlePeriodo} style={{ width: '100%' }} />
              <Select value={tipo} onChange={handleTipo} style={{ width: '100%' }}>
                <Option value="todos">Todos</Option>
                <Option value="Entradas">Entradas</Option>
                <Option value="Saídas">Saídas</Option>
                <Option value="Saldo">Saldo</Option>
              </Select>
              <div style={{ textAlign: 'right' }}>
                <Button icon={<ReloadOutlined />} onClick={fetchRelatorios} style={{ marginRight: 8 }}>Atualizar</Button>
                <Button icon={<DownloadOutlined />} onClick={() => exportar('PDF')} style={{ marginRight: 8 }}>Exportar PDF</Button>
                <Button icon={<FileExcelOutlined />} onClick={() => exportar('Excel')}>Exportar Excel</Button>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
      <Spin spinning={loading}>
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col xs={24} md={12}><Card title="Entradas/Saídas por Período"><Bar {...barConfig} /></Card></Col>
          <Col xs={24} md={12}><Card title="Distribuição Percentual">{pieData.length > 0 ? <Pie {...pieConfig} /> : <div style={{textAlign:'center',padding:'40px 0'}}>Sem dados para gráfico de pizza</div>}</Card></Col>
        </Row>
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col xs={24}><Card title="Evolução do Saldo"><Line {...lineConfig} /></Card></Col>
        </Row>
        <Card title="Detalhamento dos Lançamentos" style={{ marginBottom: 24 }}>
          <Table dataSource={relatorios} columns={colunasRelatorios} rowKey="id" pagination={false} />
        </Card>
      </Spin>
    </div>
  );
};

export default RelatoriosTesouraria; 