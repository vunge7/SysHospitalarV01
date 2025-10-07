import React, { useContext, useState, useCallback, useEffect } from 'react';
import { Card, Statistic, Button, Form, DatePicker, Select, Table, Spin, Tooltip, Row, Col, Space } from 'antd';
import { DownloadOutlined, FilterOutlined, FilePdfOutlined } from '@ant-design/icons';
import { StockContext } from '../../../contexts/StockContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import './Relatorios.css';

const { RangePicker } = DatePicker;

const Relatorios = () => {
  const { produtos, lotes, operacoesList, armazens, linhasLotes, loading, filters, setFilters, applyFilters } = useContext(StockContext);
  const [form] = Form.useForm();
  const [showFilters, setShowFilters] = useState(false);
  const [filteredOperacoes, setFilteredOperacoes] = useState([]);
  const [tableFilters, setTableFilters] = useState({
    tipoOperacao: null,
    dataInicio: null,
    dataFim: null,
    produtoId: null
  });

  // Calcula o stock total da linhasLotes
  const totalEstoque = Array.isArray(linhasLotes) ? linhasLotes.reduce((sum, linha) => sum + Number(linha.quantidade || 0), 0) : 0;

  // Calcula os lotes em expiração (menos de 30 dias)
  const lotesVencendo = lotes.filter(
    (lote) => new Date(lote.dataVencimento) < new Date(new Date().setMonth(new Date().getMonth() + 1))
  ).length;

  // Calcula lotes ativos vs inativos
  const lotesAtivos = lotes.filter(lote => lote.status).length;
  const lotesInativos = lotes.filter(lote => !lote.status).length;

  // Calcula produtos com estoque vs sem estoque
  const produtosComEstoque = Array.from(new Set(linhasLotes.filter(linha => Number(linha.quantidade) > 0).map(linha => linha.produto_id))).length;
  const produtosSemEstoque = produtos.length - produtosComEstoque;

  // Calcula armazéns com estoque vs vazios
  const armazensComEstoque = Array.from(new Set(linhasLotes.filter(linha => Number(linha.quantidade) > 0).map(linha => linha.armazem_id))).length;
  const armazensVazios = armazens.length - armazensComEstoque;

  const totalMovimentacoes = operacoesList.length;

  // Calcula movimentações por tipo
  const movimentacoesPorTipo = operacoesList.reduce((acc, operacao) => {
    acc[operacao.tipoOperacao] = (acc[operacao.tipoOperacao] || 0) + 1;
    return acc;
  }, {});

  // Prepara dados para o gráfico de pizza - Distribuição de Estoque por Armazém
  const estoquePorArmazem = Array.isArray(linhasLotes) 
    ? linhasLotes.reduce((acc, linha) => {
        const armazem = armazens.find(a => a.id === linha.armazem_id);
        const armazemNome = armazem ? armazem.designacao : `Armazém ${linha.armazem_id}`;
        const quantidade = Number(linha.quantidade || 0);
        
        const existing = acc.find(item => item.name === armazemNome);
        if (existing) {
          existing.value += quantidade;
        } else {
          acc.push({ name: armazemNome, value: quantidade });
        }
        return acc;
      }, [])
    : [];

  // Prepara dados para o gráfico de pizza - Status dos Lotes
  const statusLotesData = [
    { name: 'Lotes Ativos', value: lotesAtivos, color: '#52c41a' },
    { name: 'Lotes Inativos', value: lotesInativos, color: '#ff4d4f' },
    { name: 'A Vencer (30 dias)', value: lotesVencendo, color: '#faad14' }
  ];

  // Prepara dados para o gráfico de pizza - Distribuição de Operações
  const operacoesData = [
    { name: 'Entrada', value: movimentacoesPorTipo.ENTRADA || 0, color: '#1e40af' },
    { name: 'Saída', value: movimentacoesPorTipo.SAIDA || 0, color: '#ef4444' },
    { name: 'Transferência', value: movimentacoesPorTipo.TRANSFERENCIA || 0, color: '#10b981' },
    { name: 'Anulação', value: movimentacoesPorTipo.ANULACAO || 0, color: '#f59e0b' }
  ];

  // Prepara dados para o gráfico de tipo de operações
  const operationTypeData = operacoesList.reduce((acc, mov) => {
    const date = moment(mov.dataOperacao).format('YYYY-MM-DD');
    const existing = acc.find((item) => item.date === date);
    if (existing) {
      existing[mov.tipoOperacao] = (existing[mov.tipoOperacao] || 0) + 1;
    } else {
      acc.push({ date, [mov.tipoOperacao]: 1 });
    }
    return acc;
  }, []);

  // Função para filtrar operações por período de uma semana
  const filtrarOperacoesPorPeriodo = useCallback(() => {
    const umaSemanaAtras = moment().subtract(7, 'days');
    const operacoesRecentes = operacoesList.filter(operacao => 
      moment(operacao.dataOperacao).isAfter(umaSemanaAtras)
    );
    
    // Operações antigas para download automático
    const operacoesAntigas = operacoesList.filter(operacao => 
      moment(operacao.dataOperacao).isBefore(umaSemanaAtras)
    );
    
    if (operacoesAntigas.length > 0) {
      // Download automático das operações antigas
      const csvData = operacoesAntigas.map((mov) => {
        const linhasRes = mov.linhas || [];
        return {
          ID: mov.id,
          Tipo: mov.tipoOperacao,
          Data: moment(mov.dataOperacao).format('YYYY-MM-DD'),
          Armazém: armazens.find((a) => a.id === mov.armazemId)?.designacao || 'N/A',
          Usuário: mov.usuarioId,
          Produtos: linhasRes
            .map((linha) => `${produtos.find((p) => p.id === linha.produtoId)?.productDescription || 'Sem Descrição'} (Qtd: ${linha.qtdOperacao})`)
            .join('; ') || '-',
        };
      });
      
      const csv = [
        ['ID', 'Tipo', 'Data', 'Armazém', 'Usuário', 'Produtos'],
        ...csvData.map((row) => Object.values(row)),
      ]
        .map((row) => row.join(','))
        .join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `operacoes_antigas_${moment().format('YYYYMMDD')}.csv`;
      link.click();
      
      console.log(`Download automático de ${operacoesAntigas.length} operações antigas`);
    }
    
    return operacoesRecentes;
  }, [operacoesList, armazens, produtos]);

  // Aplicar filtros da tabela
  const aplicarFiltrosTabela = useCallback(() => {
    let operacoesFiltradas = filtrarOperacoesPorPeriodo();
    
    if (tableFilters.tipoOperacao) {
      operacoesFiltradas = operacoesFiltradas.filter(op => 
        op.tipoOperacao === tableFilters.tipoOperacao
      );
    }
    
    if (tableFilters.produtoId) {
      operacoesFiltradas = operacoesFiltradas.filter(op => 
        op.linhas && op.linhas.some(linha => linha.produtoId === tableFilters.produtoId)
      );
    }
    
    if (tableFilters.dataInicio) {
      operacoesFiltradas = operacoesFiltradas.filter(op => 
        moment(op.dataOperacao).isSameOrAfter(tableFilters.dataInicio, 'day')
      );
    }
    
    if (tableFilters.dataFim) {
      operacoesFiltradas = operacoesFiltradas.filter(op => 
        moment(op.dataOperacao).isSameOrBefore(tableFilters.dataFim, 'day')
      );
    }
    
    setFilteredOperacoes(operacoesFiltradas);
  }, [filtrarOperacoesPorPeriodo, tableFilters]);

  // Executar filtros quando os dados mudarem
  useEffect(() => {
    aplicarFiltrosTabela();
  }, [aplicarFiltrosTabela, operacoesList]);



  const handleFilterSubmit = async (values) => {
    setFilters({
      dataInicio: values.dateRange ? moment(values.dateRange[0]) : null,
      dataFim: values.dateRange ? moment(values.dateRange[1]) : null,
      armazemId: values.armazemId || null,
      produtoId: values.produtoId || null,
      tipoOperacao: values.tipoOperacao || null,
    });
    await applyFilters();
  };

  const handleExportCSV = () => {
    const csvData = operacoesList.map((mov) => {
      const linhasRes = mov.linhas || [];
      return {
        ID: mov.id,
        Tipo: mov.tipoOperacao,
        Data: moment(mov.dataOperacao).format('YYYY-MM-DD'),
        Armazém: armazens.find((a) => a.id === mov.armazemId)?.designacao || 'N/A',
        Usuário: mov.usuarioId,
        Produtos: linhasRes
          .map((linha) => `${produtos.find((p) => p.id === linha.produtoId)?.productDescription || 'Sem Descrição'} (Qtd: ${linha.qtdOperacao})`)
          .join('; ') || '-',
      };
    });
    const csv = [
      ['ID', 'Tipo', 'Data', 'Armazém', 'Usuário', 'Produtos'],
      ...csvData.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_movimentacoes_${moment().format('YYYYMMDD')}.csv`;
    link.click();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Relatório de Movimentações', 14, 20);
    const tableData = operacoesList.map((mov) => {
      const linhasRes = mov.linhas || [];
      return [
        mov.id,
        mov.tipoOperacao,
        moment(mov.dataOperacao).format('YYYY-MM-DD'),
        armazens.find((a) => a.id === mov.armazemId)?.designacao || 'N/A',
        mov.usuarioId,
        linhasRes
          .map((linha) => `${produtos.find((p) => p.id === linha.produtoId)?.productDescription || 'Sem Descrição'} (Qtd: ${linha.qtdOperacao})`)
          .join('; ') || '-',
      ];
    });
    doc.autoTable({
      head: [['ID', 'Tipo', 'Data', 'Armazém', 'Usuário', 'Produtos']],
      body: tableData,
      startY: 30,
    });
    doc.save(`relatorio_movimentacoes_${moment().format('YYYYMMDD')}.pdf`);
  };

  const movimentacaoColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Tipo', dataIndex: 'tipoOperacao', key: 'tipoOperacao' },
    {
      title: 'Data',
      dataIndex: 'dataOperacao',
      key: 'dataOperacao',
      render: (date) => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Armazém',
      key: 'armazem',
      render: (_, record) => armazens.find((a) => a.id === record.armazemId)?.designacao || 'N/A',
    },
    { title: 'Usuário', dataIndex: 'usuarioId', key: 'usuarioId' },
    {
      title: 'Produtos',
      key: 'produtos',
      render: (_, record) =>
        (record.linhas || [])
          .map((linha) => `${produtos.find((p) => p.id === linha.produtoId)?.productDescription || 'Sem Descrição'} (Qtd: ${linha.qtdOperacao})`)
          .join(', ') || '-',
    },
  ];

  return (
    <div className="relatorios-container">
      <h1 className="page-title">Relatórios</h1>
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={6}>
            <Card loading={loading}>
              <Statistic title="Estoque Total" value={totalEstoque} suffix="itens" />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card loading={loading}>
              <Statistic title="Lotes a Vencer (30 dias)" value={lotesVencendo} suffix="lotes" />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card loading={loading}>
              <Statistic title="Movimentações (Total)" value={totalMovimentacoes} suffix="registros" />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card loading={loading}>
              <Statistic title="Lotes Ativos" value={lotesAtivos} suffix="lotes" />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} sm={6}>
            <Card loading={loading}>
              <Statistic title="Produtos com Estoque" value={produtosComEstoque} suffix="produtos" />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card loading={loading}>
              <Statistic title="Armazéns com Estoque" value={armazensComEstoque} suffix="armazéns" />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card loading={loading}>
              <Statistic title="Lotes Inativos" value={lotesInativos} suffix="lotes" />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card loading={loading}>
              <Statistic title="Total de Produtos" value={produtos.length} suffix="produtos" />
            </Card>
          </Col>
        </Row>

        <div className="filter-section">
          <Tooltip title="Filtros">
            <Button
              icon={<FilterOutlined />}
              onClick={() => setShowFilters(!showFilters)}
              type="primary"
              shape="circle"
              className="filter-button"
            />
          </Tooltip>
          {showFilters && (
            <Form form={form} onFinish={handleFilterSubmit} layout="vertical" className="filter-form">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Período" name="dateRange">
                    <RangePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Armazém" name="armazemId">
                    <Select placeholder="Selecione o armazém" allowClear>
                      {armazens.map((a) => (
                        <Select.Option key={a.id} value={a.id}>
                          {a.designacao}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Produto" name="produtoId">
                    <Select placeholder="Selecione o produto" allowClear showSearch optionFilterProp="children">
                      {produtos.map((p) => (
                        <Select.Option key={p.id} value={p.id}>
                          {p.productDescription || 'Sem Descrição'}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Tipo de Operação" name="tipoOperacao">
                    <Select placeholder="Selecione o tipo" allowClear>
                      {['ENTRADA', 'SAIDA', 'TRANSFERENCIA', 'ANULACAO'].map((tipo) => (
                        <Select.Option key={tipo} value={tipo}>
                          {tipo}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" disabled={loading}>
                      Aplicar Filtros
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          )}
        </div>

        <div className="chart-section">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <h2 className="section-title">Distribuição de Estoque por Armazém</h2>
              <PieChart width={400} height={300}>
                <Pie
                  data={estoquePorArmazem}
                  cx={200}
                  cy={150}
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {estoquePorArmazem.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index % 5]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </Col>
            
            <Col xs={24} lg={12}>
              <h2 className="section-title">Status dos Lotes</h2>
              <PieChart width={400} height={300}>
                <Pie
                  data={statusLotesData}
                  cx={200}
                  cy={150}
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusLotesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={12}>
              <h2 className="section-title">Distribuição de Operações</h2>
              <PieChart width={400} height={300}>
                <Pie
                  data={operacoesData}
                  cx={200}
                  cy={150}
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {operacoesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </Col>
            
            <Col xs={24} lg={12}>
              <h2 className="section-title">Movimentações por Tipo</h2>
              <LineChart width={400} height={300} data={operationTypeData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="ENTRADA" stroke="#1e40af" />
                <Line type="monotone" dataKey="SAIDA" stroke="#ef4444" />
                <Line type="monotone" dataKey="TRANSFERENCIA" stroke="#10b981" />
                <Line type="monotone" dataKey="ANULACAO" stroke="#f59e0b" />
              </LineChart>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24}>
              <h2 className="section-title">Operações por Tipo (Gráfico de Barras)</h2>
              <BarChart width={1000} height={300} data={operacoesData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8">
                  {operacoesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </Col>
          </Row>
        </div>

        <div className="table-section">
          <h2 className="section-title">Detalhes das Movimentações (Última Semana)</h2>
          
          {/* Filtros da tabela */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={6}>
              <Form.Item label="Tipo de Operação">
                <Select 
                  placeholder="Filtrar por tipo" 
                  allowClear
                  value={tableFilters.tipoOperacao}
                  onChange={(value) => setTableFilters(prev => ({ ...prev, tipoOperacao: value }))}
                >
                  {['ENTRADA', 'SAIDA', 'TRANSFERENCIA', 'ANULACAO'].map((tipo) => (
                    <Select.Option key={tipo} value={tipo}>
                      {tipo}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item label="Data Início">
                <DatePicker 
                  format="YYYY-MM-DD" 
                  style={{ width: '100%' }}
                  value={tableFilters.dataInicio}
                  onChange={(date) => setTableFilters(prev => ({ ...prev, dataInicio: date }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item label="Data Fim">
                <DatePicker 
                  format="YYYY-MM-DD" 
                  style={{ width: '100%' }}
                  value={tableFilters.dataFim}
                  onChange={(date) => setTableFilters(prev => ({ ...prev, dataFim: date }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item label="Produto">
                <Select 
                  placeholder="Filtrar por produto" 
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  value={tableFilters.produtoId}
                  onChange={(value) => setTableFilters(prev => ({ ...prev, produtoId: value }))}
                >
                  {produtos.map((p) => (
                    <Select.Option key={p.id} value={p.id}>
                      {p.productDescription || 'Sem Descrição'}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Space style={{ marginBottom: 16 }}>
            <Tooltip title="Exportar CSV">
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExportCSV}
                type="primary"
                shape="circle"
                className="export-button"
              />
            </Tooltip>
            <Tooltip title="Exportar PDF">
              <Button
                icon={<FilePdfOutlined />}
                onClick={handleExportPDF}
                type="primary"
                shape="circle"
                className="export-button"
              />
            </Tooltip>
            <Button 
              onClick={() => setTableFilters({
                tipoOperacao: null,
                dataInicio: null,
                dataFim: null,
                produtoId: null
              })}
            >
              Limpar Filtros
            </Button>
          </Space>
          <Table
            columns={movimentacaoColumns}
            dataSource={filteredOperacoes}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
            className="custom-table"
          />
        </div>
      </Spin>
    </div>
  );
};

export default Relatorios;