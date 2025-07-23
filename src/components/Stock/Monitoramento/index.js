import React, { useState, useEffect, useMemo } from 'react';
import { Table, Alert, Spin, Select, Input, Button, Typography, DatePicker, Tag } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'moment-timezone';
import { api } from '../../../service/api'; // Importa o axios configurado
import '../Monitoramento/Monitoramento.css';

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

 let filteredArtigos = artigos;
 if (searchTerm) {
 filteredArtigos = filteredArtigos.filter((artigo) =>
 artigo.nome?.toLowerCase().includes(searchTerm.toLowerCase())
 );
 }
 setFilteredArtigos(filteredArtigos);
 };

 // Limpar filtros
 const clearFilters = () => {
 setSearchTerm('');
 setStatusFilter(null);
 setDateRange([null, null]);
 setFilteredLotes(lotes);
 setFilteredArtigos(artigos);
 };

 // Colunas da tabela de lotes
 const loteColumns = [
 {
 title: 'Designação',
 dataIndex: 'designacao',
 key: 'designacao',
 sorter: (a, b) => a.designacao?.localeCompare(b.designacao || ''),
 },
 {
 title: 'Produto',
 dataIndex: 'artigoId',
 key: 'artigoNome',
 render: (artigoId) => artigos.find((a) => a.id === artigoId)?.nome || 'Desconhecido',
 sorter: (a, b) => {
 const nomeA = artigos.find((art) => art.id === a.artigoId)?.nome || '';
 const nomeB = artigos.find((art) => art.id === b.artigoId)?.nome || '';
 return nomeA.localeCompare(nomeB);
 },
 },
 {
 title: 'Quantidade Total',
 dataIndex: 'quantidadeTotal',
 key: 'quantidadeTotal',
 render: (quantidade) => (
 <span style={{ color: quantidade < 24 ? 'red' : 'inherit' }}>
 {quantidade || 0} {quantidade < 24 && <Tag color="red">Estoque Baixo</Tag>}
 </span>
 ),
 sorter: (a, b) => (a.quantidadeTotal || 0) - (b.quantidadeTotal || 0),
 },
 {
 title: 'Data de Vencimento',
 dataIndex: 'dataVencimento',
 key: 'dataVencimento',
 render: (data) => {
 const vencimento = moment(data).tz('Africa/Luanda');
 const diasRestantes = vencimento.diff(moment().tz('Africa/Luanda'), 'days');
 return (
 <span>
 {vencimento.format('YYYY-MM-DD')}
 {diasRestantes <= 30 && diasRestantes >= 0 && (
 <Tag color="orange" style={{ marginLeft: 8 }}>
 Expira em {diasRestantes} dias
 </Tag>
 )}
 {diasRestantes < 0 && (
 <Tag color="red" style={{ marginLeft: 8 }}>
 Vencido
 </Tag>
 )}
 </span>
 );
 },
 sorter: (a, b) => moment(a.dataVencimento).unix() - moment(b.dataVencimento).unix(),
 },
 {
 title: 'Estado',
 dataIndex: 'status',
 key: 'status',
 render: (status) => <Tag color={status ? 'green' : 'red'}>{status ? 'Ativo' : 'Inativo'}</Tag>,
 sorter: (a, b) => (a.status ? 1 : 0) - (b.status ? 1 : 0),
 },
 ];

 // Colunas da tabela de lotes próximos do vencimento
 const expiringLoteColumns = [
 { title: 'ID', dataIndex: 'id', key: 'id' },
 { title: 'Designação', dataIndex: 'designacao', key: 'designacao' },
 {
 title: 'Produto',
 dataIndex: 'artigoId',
 key: 'artigoNome',
 render: (artigoId) => artigos.find((a) => a.id === artigoId)?.nome || 'Desconhecido',
 },
 {
 title: 'Data de Vencimento',
 dataIndex: 'dataVencimento',
 key: 'dataVencimento',
 render: (data) => moment(data).tz('Africa/Luanda').format('YYYY-MM-DD'),
 },
 {
 title: 'Dias Restantes',
 dataIndex: 'diasRestantes',
 key: 'diasRestantes',
 render: (days) => (
 <Tag color={days <= 30 ? 'red' : days <= 90 ? 'orange' : 'green'}>
 {days} dias
 </Tag>
 ),
 },
 { title: 'Alerta', dataIndex: 'threshold', key: 'threshold' },
 ];

 // Colunas da tabela de artigos
 const artigoColumns = [
 {
 title: 'Nome',
 dataIndex: 'nome',
 key: 'nome',
 sorter: (a, b) => a.nome?.localeCompare(b.nome || ''),
 render: (nome) => nome || 'Sem nome',
 },
 ];

 if (loading) return <Spin tip="Carregando dados..." />;
 if (error) return <Alert message="Erro" description={error} type="error" showIcon />;

 return (
 <div className="monitoramento-container">
 <Title level={2} className="section-title">Monitoramento de Estoque</Title>
 <div className="filters">
 <Input
 prefix={<SearchOutlined />}
 placeholder="Pesquisar por designação ou nome do produto"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 style={{ width: 250, marginRight: 16 }}
 disabled={loading}
 />
 <Select
 placeholder="Filtrar por status"
 value={statusFilter}
 onChange={(value) => setStatusFilter(value)}
 style={{ width: 150, marginRight: 16 }}
 allowClear
 disabled={loading}
 >
 <Option value="ativo">Ativo</Option>
 <Option value="inativo">Inativo</Option>
 </Select>
 <RangePicker
 format="YYYY-MM-DD"
 value={dateRange}
 onChange={(dates) => setDateRange(dates)}
 style={{ marginRight: 16 }}
 placeholder={['Data Início', 'Data Fim']}
 disabled={loading}
 />
 <Button
 icon={<FilterOutlined />}
 onClick={filterData}
 type="primary"
 loading={loading}
 style={{ marginRight: 8 }}
 >
 Aplicar Filtros
 </Button>
 <Button onClick={clearFilters} disabled={loading}>
 Limpar Filtros
 </Button>
 </div>
 {expiringLotes.length > 0 && (
 <Alert
 message="Lotes Próximos do Vencimento"
 description={`Existem ${expiringLotes.length} lotes com vencimento em até um ano.`}
 type="warning"
 showIcon
 style={{ marginBottom: 16 }}
 />
 )}
 <Title level={3}>Lotes Próximos do Vencimento</Title>
 <Table
 columns={expiringLoteColumns}
 dataSource={expiringLotes}
 rowKey="id"
 pagination={{ pageSize: 10 }}
 scroll={{ x: 'max-content' }}
 className="custom-table"
 style={expiringLotes.length > 0 ? { marginBottom: 24 } : { marginBottom: 0 }}
 locale={{ emptyText: 'Nenhum lote próximo do vencimento encontrado.' }}
 />
 <Title level={3}>Lotes</Title>
 <Table
 columns={loteColumns}
 dataSource={filteredLotes}
 rowKey="id"
 pagination={{ pageSize: 10 }}
 scroll={{ x: 'max-content' }}
 className="custom-table"
 style={{ marginBottom: 24 }}
 locale={{ emptyText: 'Nenhum lote encontrado.' }}
 />
 <Title level={3}>Produtos</Title>
 <Table
 columns={artigoColumns}
 dataSource={filteredArtigos}
 rowKey="id"
 pagination={{ pageSize: 10 }}
 scroll={{ x: 'max-content' }}
 className="custom-table"
 locale={{ emptyText: 'Nenhum produto encontrado.' }}
 />
 </div>
 );
};

export default Monitoramento;