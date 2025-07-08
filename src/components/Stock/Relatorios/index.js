import React, { useContext, useState } from 'react';
import { Card, Statistic, Button, Form, DatePicker, Select, Table, Spin, Tooltip, Row, Col, Space } from 'antd';
import { DownloadOutlined, FilterOutlined, FilePdfOutlined } from '@ant-design/icons';
import { StockContext } from '../../../contexts/StockContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { BarChart, Bar, AreaChart, Area } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import './Relatorios.css';

const { RangePicker } = DatePicker;

const Relatorios = () => {
  const { produtos, lotes, operacoesList, armazens, linhasLotes, loading, filters, setFilters, applyFilters } = useContext(StockContext);
  const [form] = Form.useForm();
  const [showFilters, setShowFilters] = useState(false);

  // Calcula o stock total da linhasLotes
  const totalEstoque = Array.isArray(linhasLotes) ? linhasLotes.reduce((sum, linha) => sum + Number(linha.quantidade || 0), 0) : 0;

  // Calcula os lotes em expiração (menos de 30 dias)
  const lotesVencendo = lotes.filter(
    (lote) => new Date(lote.dataVencimento) < new Date(new Date().setMonth(new Date().getMonth() + 1))
  ).length;

  const totalMovimentacoes = operacoesList.length;

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

  // Prepara os dados para o gráfico de tendências de stock
  const stockTrendData = Array.isArray(linhasLotes)
    ? linhasLotes.reduce((acc, linha) => {
        const produto = produtos.find((p) => p.id === linha.produto_id);
        const date = moment(linha.createdAt || new Date()).format('YYYY-MM-DD');
        const existing = acc.find((item) => item.date === date);
        if (existing) {
          existing.quantidade = (existing.quantidade || 0) + Number(linha.quantidade);
        } else {
          acc.push({ date, quantidade: Number(linha.quantidade) });
        }
        return acc.sort((a, b) => new Date(a.date) - new Date(b.date));
      }, [])
    : [];

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
          <Col xs={24} sm={8}>
            <Card loading={loading}>
              <Statistic title="Estoque Total" value={totalEstoque} suffix="itens" />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card loading={loading}>
              <Statistic title="Lotes a Vencer (30 dias)" value={lotesVencendo} suffix="lotes" />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card loading={loading}>
              <Statistic title="Movimentações (Total)" value={totalMovimentacoes} suffix="registros" />
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
          <h2 className="section-title">Movimentações por Tipo</h2>
          <LineChart width={1000} height={300} data={operationTypeData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
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

          <h2 className="section-title">Tendência de Estoque</h2>
          <AreaChart width={1000} height={300} data={stockTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Area type="monotone" dataKey="quantidade" stroke="#8884d8" fill="#8884d8" />
          </AreaChart>

          <h2 className="section-title">Distribuição de Operações</h2>
          <BarChart width={1000} height={300} data={operationTypeData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Bar dataKey="ENTRADA" fill="#1e40af" />
            <Bar dataKey="SAIDA" fill="#ef4444" />
            <Bar dataKey="TRANSFERENCIA" fill="#10b981" />
            <Bar dataKey="ANULACAO" fill="#f59e0b" />
          </BarChart>
        </div>

        <div className="table-section">
          <h2 className="section-title">Detalhes das Movimentações</h2>
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
          </Space>
          <Table
            columns={movimentacaoColumns}
            dataSource={operacoesList}
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