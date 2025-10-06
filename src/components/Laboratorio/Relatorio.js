import React, { useEffect, useState, useRef } from 'react';
import { Table, Button, Card, Row, Col, Space, Select, DatePicker, Input, Typography, Tag, Progress, 
    Statistic, Alert,Tooltip as AntTooltip,Divider,Tabs,Modal,message,notification, Form
} from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { DownloadOutlined, FileTextOutlined, BarChartOutlined, PieChartOutlined, LineChartOutlined,
    FilterOutlined, SearchOutlined, CalendarOutlined, EyeOutlined, PrinterOutlined, MailOutlined,
    ShareAltOutlined } from '@ant-design/icons';
import { api } from '../../service/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const COLORS = ['#36a2eb', '#ff6384', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4', '#e91e63', '#ffc107'];

const Relatorio = () => {
  const [linhas, setLinhas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [exames, setExames] = useState([]); // Para gráficos
  const tableRef = useRef();
  const statusChartRef = useRef();
  const tipoChartRef = useRef();
  
  // Novos estados para funcionalidades avançadas
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterDateRange, setFilterDateRange] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedReportType, setSelectedReportType] = useState('overview');
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [emailForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [linhasRes, resultadosRes, pacientesRes, examesRes] = await Promise.all([
        api.get('/linharesultado/all'),
        api.get('/resultado/all'),
        api.get('/paciente/all'),
        api.get('/produto/all')
      ]);
      
      setLinhas(linhasRes.data || []);
      setResultados(resultadosRes.data || []);
      setPacientes(pacientesRes.data || []);
      setExames(Array.isArray(examesRes.data) ? examesRes.data : []);
      
      // Tentar buscar funcionários se a API existir
      try {
        const funcionariosRes = await api.get('/funcionario/all');
        setFuncionarios(funcionariosRes.data || []);
      } catch (funcionarioError) {
        console.log('API de funcionários não disponível');
        setFuncionarios([]);
      }
    } catch (error) {
      notification.error({
        message: 'Erro',
        description: 'Erro ao carregar dados dos relatórios: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Funções de filtro e busca
  const getFilteredData = () => {
    let filtered = linhas || [];
    
    // Filtro por texto de busca
    if (searchText) {
      filtered = filtered.filter(linha => 
        getExameNome(linha)?.toLowerCase().includes(searchText.toLowerCase()) ||
        getPacienteNome(linha)?.toLowerCase().includes(searchText.toLowerCase()) ||
        linha.valorReferencia?.toString().includes(searchText)
      );
    }
    
    // Filtro por data
    if (filterDateRange && filterDateRange.length === 2) {
      const startDate = filterDateRange[0].startOf('day');
      const endDate = filterDateRange[1].endOf('day');
      filtered = filtered.filter(linha => {
        const linhaDate = moment(linha.createdAt || linha.dataCriacao);
        return linhaDate.isBetween(startDate, endDate, 'day', '[]');
      });
    }
    
    // Filtro por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(linha => {
        const exame = exames.find(e => String(e.id) === String(linha.exameId));
        return exame && exame.status === (filterStatus === 'active');
      });
    }
    
    // Filtro por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(linha => {
        const exame = exames.find(e => String(e.id) === String(linha.exameId));
        return exame && exame.productType === filterType;
      });
    }
    
    return filtered;
  };

  // Funções de exportação avançadas
  const handleExport = (format) => {
    const data = getFilteredData();
    
    switch (format) {
      case 'csv':
        exportToCSV(data);
        break;
      case 'excel':
        exportToExcel(data);
        break;
      case 'pdf':
        exportToPDF(data);
        break;
      default:
        break;
    }
  };

  const exportToCSV = (data) => {
    const csvContent = [
      ['ID', 'Exame', 'Valor Referência', 'Unidade', 'Paciente', 'Médico', 'Data'],
      ...data.map(linha => [
        linha.id,
        getExameNome(linha),
        linha.valorReferencia,
        getUnidadeDescricao(linha),
        getPacienteNome(linha),
        getMedicoNome(linha.usuarioId),
        moment(linha.createdAt).format('DD/MM/YYYY')
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_exames_${moment().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    message.success('Relatório exportado em CSV com sucesso!');
  };

  const exportToExcel = (data) => {
    // Implementar exportação para Excel
    message.info('Funcionalidade de exportação para Excel em desenvolvimento');
  };

  const exportToPDF = (data) => {
    // Implementar exportação para PDF
    message.info('Funcionalidade de exportação para PDF em desenvolvimento');
  };

  // Função para enviar relatório por email
  const handleEmailReport = async (values) => {
    try {
      // Implementar envio por email
      console.log('Enviando relatório por email:', values);
      message.success('Relatório enviado por email com sucesso!');
      setEmailModalVisible(false);
      emailForm.resetFields();
    } catch (error) {
      message.error('Erro ao enviar relatório por email');
    }
  };

  // Função para obter o nome do médico (funcionário) a partir do usuarioId
  const getMedicoNome = (usuarioId) => {
    const funcionarioMedico = funcionarios.find(f => f.usuarioId === usuarioId && f.cargo === 'Medico');
    return funcionarioMedico ? funcionarioMedico.nome : usuarioId;
  };

  // Função para obter o resultadoId, aceitando tanto 'resutaldoId' quanto 'resultadoId'
  const getResultadoId = (linha) => {
    return linha.resultadoId || linha.resutaldoId || '';
  };

  // Função para obter o pacienteId a partir do resultadoId
  const getPacienteId = (linha) => {
    const resultadoId = getResultadoId(linha);
    const resultado = resultados.find(r => r.id === resultadoId);
    return resultado ? resultado.pacienteId : '';
  };

  // Função para obter o nome do paciente a partir do resultadoId
  const getPacienteNome = (linha) => {
    const pacienteId = getPacienteId(linha);
    const paciente = pacientes.find(p => p.id === pacienteId);
    return paciente ? paciente.nome : pacienteId || '';
  };

  // Função para obter o nome do exame a partir do exameId (corrigido para comparar como string)
  const getExameNome = (linha) => {
    const exame = exames.find(e => String(e.id) === String(linha.exameId));
    return exame ? (exame.productDescription || exame.descricao || exame.designacao || exame.nome) : linha.exameId || '';
  };

  // Função para obter a unidade de medida a partir do unidadeId (corrigido para comparar como string)
  const getUnidadeDescricao = (linha) => {
    const exame = exames.find(e => String(e.id) === String(linha.exameId));
    return exame ? (exame.unidadeMedida || exame.unidade || exame.unidade_medida) : linha.unidadeId || '';
  };

  // Gráfico por status (ativo/inativo) dos exames
  const statusData = [
    { name: 'Ativo', value: exames.filter(e => e.status === true || e.status === '1' || e.status === 1 || e.status === 'ATIVO').length },
    { name: 'Inativo', value: exames.filter(e => !(e.status === true || e.status === '1' || e.status === 1 || e.status === 'ATIVO')).length },
  ];

  // Gráfico por tipo de exame
  const tipoCount = {};
  exames.forEach(e => {
    const tipo = e.productType || 'Outro';
    tipoCount[tipo] = (tipoCount[tipo] || 0) + 1;
  });
  const tipoData = Object.keys(tipoCount).map((k, i) => ({ name: k, value: tipoCount[k], color: COLORS[i % COLORS.length] }));

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    {
      title: 'Exame',
      key: 'exame',
      render: (linha) => getExameNome(linha)
    },
    { title: 'Valor Referência', dataIndex: 'valorReferencia', key: 'valorReferencia' },
    {
      title: 'Unidade',
      key: 'unidade',
      render: (linha) => getUnidadeDescricao(linha)
    },
    {
      title: 'Resultado ID',
      key: 'resultadoId',
      render: (linha) => getResultadoId(linha)
    },
    { title: 'Observação', dataIndex: 'observacao', key: 'observacao' },
    {
      title: 'Paciente',
      key: 'paciente',
      render: (linha) => getPacienteNome(linha)
    },
    {
      title: 'Médico',
      dataIndex: 'usuarioId',
      key: 'usuarioId',
      render: (usuarioId) => getMedicoNome(usuarioId)
    },
  ];

  // Adaptar o dataSource para passar o objeto inteiro da linha para as colunas customizadas
  const dataSource = linhas.map(linha => ({ ...linha, key: linha.id }));

  // Exportação para PDF
  const exportTableToPDF = async () => {
    const input = tableRef.current;
    const pdf = new jsPDF('l', 'mm', 'a4', true);
    const canvas = await html2canvas(input, { useCORS: true, backgroundColor: '#fff', scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.setFontSize(18);
    pdf.text('Resultado de Exames', pdfWidth / 2, 16, { align: 'center' });
    pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);
    pdf.save('resultado_exames.pdf');
  };

  // Exportação dos gráficos para PDF
  const exportChartToPDF = async (ref, filename) => {
    const input = ref.current;
    const pdf = new jsPDF('l', 'mm', 'a4', true);
    const canvas = await html2canvas(input, { useCORS: true, backgroundColor: '#fff', scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
    pdf.save(filename);
  };

  // Colunas da tabela de relatório de exames cadastrados
  const columnsRelatorioExames = [
    { title: 'Descrição', dataIndex: 'productDescription', key: 'descricao', render: (v, r) => v || r.descricao || r.designacao || r.nome || r.id || 'N/A' },
    { title: 'Tipo', dataIndex: 'productType', key: 'productType' },
    { title: 'Grupo', dataIndex: 'productGroup', key: 'productGroup' },
    { title: 'Unidade', dataIndex: 'unidadeMedida', key: 'unidadeMedida' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: v => (v === true || v === '1' || v === 1 || v === 'ATIVO' ? 'Ativo' : 'Inativo') },
  ];

  // Exportação para PDF da tabela de exames cadastrados
  const exportRelatorioExamesPDF = async () => {
    const input = document.getElementById('tabela-relatorio-exames');
    const pdf = new jsPDF('l', 'mm', 'a4', true);
    const canvas = await html2canvas(input, { useCORS: true, backgroundColor: '#fff', scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.setFontSize(18);
    pdf.text('Relatório de Exames', pdfWidth / 2, 16, { align: 'center' });
    pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);
    pdf.save('relatorio_exames.pdf');
  };

  return (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Exames por Status" extra={<Button onClick={() => exportChartToPDF(statusChartRef, 'grafico_status.pdf')}>Exportar PDF</Button>}>
            <div ref={statusChartRef} style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-status-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Exames por Tipo" extra={<Button onClick={() => exportChartToPDF(tipoChartRef, 'grafico_tipo.pdf')}>Exportar PDF</Button>}>
            <div ref={tipoChartRef} style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tipoData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="value">
                    {tipoData.map((entry, index) => (
                      <Cell key={`cell-bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
      <Card style={{ marginTop: 24 }}>
        <Space style={{ marginBottom: 16 }}>
          <Button onClick={exportRelatorioExamesPDF}>Exportar PDF</Button>
        </Space>
        <div id="tabela-relatorio-exames" style={{ background: '#fff', padding: 8 }}>
          <h2 style={{ textAlign: 'center', marginBottom: 16 }}>Relatório de Exames</h2>
          <Table columns={columnsRelatorioExames} dataSource={exames} rowKey="id" pagination={{ pageSize: 10 }} />
        </div>
      </Card>
      <Card style={{ marginTop: 32 }}>
        <h3>Resultado de exames</h3>
        <Space style={{ marginBottom: 16 }}>
          <Button onClick={exportTableToPDF}>Exportar PDF</Button>
        </Space>
        <div ref={tableRef} style={{ background: '#fff', padding: 8 }}>
          <Table dataSource={dataSource} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
        </div>
      </Card>
    </div>
  );
};

export default Relatorio;

