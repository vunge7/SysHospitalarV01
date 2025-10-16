import React, { useEffect, useState, useRef } from 'react';
import { Table, Button, Card, Row, Col, Space, Select, DatePicker, Input, Typography, Tag, Progress, 
    Statistic, Alert,Tooltip as AntTooltip,Divider,Tabs,Modal,message,notification, Form, InputNumber
} from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { DownloadOutlined, FileTextOutlined, BarChartOutlined, PieChartOutlined, LineChartOutlined,
    FilterOutlined, SearchOutlined, CalendarOutlined, EyeOutlined, PrinterOutlined, MailOutlined,
    ShareAltOutlined, EditOutlined } from '@ant-design/icons';
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
  const [exames, setExames] = useState([]);
  const tableRef = useRef();
  const statusChartRef = useRef();
  const tipoChartRef = useRef();
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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [selectedLinha, setSelectedLinha] = useState(null);

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

  const getFilteredData = () => {
    let filtered = linhas || [];
    
    if (searchText) {
      filtered = filtered.filter(linha => 
        getExameNome(linha)?.toLowerCase().includes(searchText.toLowerCase()) ||
        getPacienteNome(linha)?.toLowerCase().includes(searchText.toLowerCase()) ||
        linha.valorReferencia?.toString().includes(searchText)
      );
    }
    
    if (filterDateRange && filterDateRange.length === 2) {
      const startDate = filterDateRange[0].startOf('day');
      const endDate = filterDateRange[1].endOf('day');
      filtered = filtered.filter(linha => {
        const linhaDate = moment(linha.createdAt || linha.dataCriacao);
        return linhaDate.isBetween(startDate, endDate, 'day', '[]');
      });
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(linha => {
        const exame = exames.find(e => String(e.id) === String(linha.exameId));
        return exame && exame.status === (filterStatus === 'active');
      });
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(linha => {
        const exame = exames.find(e => String(e.id) === String(linha.exameId));
        return exame && exame.productType === filterType;
      });
    }
    
    return filtered;
  };

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
    message.info('Funcionalidade de exportação para Excel em desenvolvimento');
  };

  const exportToPDF = (data) => {
    message.info('Funcionalidade de exportação para PDF em desenvolvimento');
  };

  const handleEmailReport = async (values) => {
    try {
      console.log('Enviando relatório por email:', values);
      message.success('Relatório enviado por email com sucesso!');
      setEmailModalVisible(false);
      emailForm.resetFields();
    } catch (error) {
      message.error('Erro ao enviar relatório por email');
    }
  };

  const getMedicoNome = (usuarioId) => {
    const funcionarioMedico = funcionarios.find(f => f.usuarioId === usuarioId && f.cargo === 'Medico');
    return funcionarioMedico ? funcionarioMedico.nome : usuarioId;
  };

  const getResultadoId = (linha) => {
    return linha.resultadoId || linha.resutaldoId || '';
  };

  const getPacienteId = (linha) => {
    const resultadoId = getResultadoId(linha);
    const resultado = resultados.find(r => r.id === resultadoId);
    return resultado ? resultado.pacienteId : '';
  };

  const getPacienteNome = (linha) => {
    const pacienteId = getPacienteId(linha);
    const paciente = pacientes.find(p => p.id === pacienteId);
    return paciente ? paciente.nome : pacienteId || '';
  };

  const getExameNome = (linha) => {
    const exame = exames.find(e => String(e.id) === String(linha.exameId));
    return exame ? (exame.productDescription || exame.descricao || exame.designacao || exame.nome) : linha.exameId || '';
  };

  const getUnidadeDescricao = (linha) => {
    const exame = exames.find(e => String(e.id) === String(linha.exameId));
    return exame ? (exame.unidadeMedida || exame.unidade || exame.unidade_medida) : linha.unidadeId || '';
  };

  const statusData = [
    { name: 'Ativo', value: exames.filter(e => e.status === true || e.status === '1' || e.status === 1 || e.status === 'ATIVO').length },
    { name: 'Inativo', value: exames.filter(e => !(e.status === true || e.status === '1' || e.status === 1 || e.status === 'ATIVO')).length },
  ];

  const tipoCount = {};
  exames.forEach(e => {
    const tipo = e.productType || 'Outro';
    tipoCount[tipo] = (tipoCount[tipo] || 0) + 1;
  });
  const tipoData = Object.keys(tipoCount).map((k, i) => ({ name: k, value: tipoCount[k], color: COLORS[i % COLORS.length] }));

  const handleEditLinha = (linha) => {
    setSelectedLinha(linha);
    const exame = exames.find(e => String(e.id) === String(linha.exameId));
    editForm.setFieldsValue({
      valorReferencia: linha.valorReferencia || null,
      observacao: linha.observacao || '',
      intervaloReferencia: exame?.intervaloReferencia || 'N/A'
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    if (!selectedLinha) {
      message.error('Nenhuma linha selecionada para edição!');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...selectedLinha,
        valorReferencia: values.valorReferencia,
        observacao: values.observacao || ''
      };
      await api.put(`/linharesultado/${selectedLinha.id}`, payload);
      message.success('Resultado atualizado com sucesso!');
      setLinhas(prev => prev.map(l => l.id === selectedLinha.id ? { ...l, ...payload } : l));
      setEditModalVisible(false);
      editForm.resetFields();
      setSelectedLinha(null);
    } catch (error) {
      message.error(`Erro ao atualizar resultado: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
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
    {
      title: 'Ações',
      key: 'actions',
      render: (_, linha) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEditLinha(linha)}
        >
          Editar
        </Button>
      )
    }
  ];

  const expandedRowRender = (linha) => {
    const detalhesColumns = [
      {
        title: 'Exame',
        key: 'exame',
        render: () => getExameNome(linha)
      },
      { title: 'Valor Referência', dataIndex: 'valorReferencia', key: 'valorReferencia' },
      {
        title: 'Unidade',
        key: 'unidade',
        render: () => getUnidadeDescricao(linha)
      },
      { title: 'Observação', dataIndex: 'observacao', key: 'observacao' },
      {
        title: 'Data',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (createdAt) => moment(createdAt).format('DD/MM/YYYY')
      }
    ];

    return (
      <Table
        columns={detalhesColumns}
        dataSource={[linha]}
        pagination={false}
        rowKey="id"
      />
    );
  };

  const dataSource = linhas.map(linha => ({ ...linha, key: linha.id }));

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

  const columnsRelatorioExames = [
    { title: 'Descrição', dataIndex: 'productDescription', key: 'descricao', render: (v, r) => v || r.descricao || r.designacao || r.nome || r.id || 'N/A' },
    { title: 'Tipo', dataIndex: 'productType', key: 'productType' },
    { title: 'Grupo', dataIndex: 'productGroup', key: 'productGroup' },
    { title: 'Unidade', dataIndex: 'unidadeMedida', key: 'unidadeMedida' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: v => (v === true || v === '1' || v === 1 || v === 'ATIVO' ? 'Ativo' : 'Inativo') },
  ];

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
        <h3>Resultado de Exames</h3>
        <Space style={{ marginBottom: 16 }}>
          <Button onClick={exportTableToPDF}>Exportar PDF</Button>
        </Space>
        <div ref={tableRef} style={{ background: '#fff', padding: 8 }}>
          <Table
            dataSource={dataSource}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            expandable={{
              expandedRowRender,
              rowExpandable: () => true
            }}
          />
        </div>
      </Card>
      <Modal
        title="Editar Resultado do Exame"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
          setSelectedLinha(null);
        }}
        footer={null}
        style={{ borderRadius: '12px', overflow: 'hidden' }}
        styles={{
          body: {
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '0 0 12px 12px',
          },
          header: {
            background: 'linear-gradient(90deg, #e6f0fa 0%, #d6e6ff 100%)',
            color: '#0052cc',
            fontWeight: 600,
            fontSize: '18px',
            padding: '16px 24px',
            borderRadius: '12px 12px 0 0',
            borderBottom: '2px solid #007bff',
          },
        }}
      >
        {selectedLinha && (
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditSubmit}
            style={{ padding: '8px 0' }}
          >
            <Form.Item label="Intervalo de Referência">
              <Tag color="blue">{editForm.getFieldValue('intervaloReferencia') || 'N/A'}</Tag>
            </Form.Item>
            <Form.Item
              name="valorReferencia"
              label="Valor de Referência"
              rules={[{ required: true, message: 'Insira o valor de referência' }]}
            >
              <InputNumber
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  border: '1px solid #d9e1f2',
                  padding: '8px',
                  fontSize: '14px',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
                step={0.01}
              />
            </Form.Item>
            <Form.Item name="observacao" label="Observação">
              <Input.TextArea
                rows={4}
                placeholder="Observações sobre o exame"
                style={{
                  borderRadius: '8px',
                  border: '1px solid #d9e1f2',
                  padding: '8px',
                  fontSize: '14px',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              />
            </Form.Item>
            <Form.Item
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '24px',
              }}
            >
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  backgroundColor: '#007bff',
                  borderColor: '#007bff',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '8px 24px',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  transform: 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0056b3';
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#007bff';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Salvar Alterações
              </Button>
              <Button
                onClick={() => {
                  setEditModalVisible(false);
                  editForm.resetFields();
                  setSelectedLinha(null);
                }}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #d9e1f2',
                  color: '#4b5e77',
                  padding: '8px 24px',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  transform: 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e6f0fa';
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 82, 204, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Cancelar
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default Relatorio;