import React, { useState } from 'react';
import { Button, Table, Modal, Form, Input, DatePicker, Select, Tag, Row, Col, message } from 'antd';
import { PlusOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

const mockMovimentos = [
  { id: 1, tipo: 'entrada', descricao: 'Pagamento Consulta', valor: 5000, data: '2024-06-10' },
  { id: 2, tipo: 'saida', descricao: 'Compra de Medicamentos', valor: 2000, data: '2024-06-10' },
  { id: 3, tipo: 'entrada', descricao: 'Pagamento Exame', valor: 8000, data: '2024-06-11' },
  { id: 4, tipo: 'saida', descricao: 'Pagamento Funcionário', valor: 3000, data: '2024-06-11' },
];

const colunasMovimentos = [
  { title: 'Tipo', dataIndex: 'tipo', key: 'tipo', render: t => t === 'entrada' ? <Tag color="green">Entrada</Tag> : <Tag color="red">Saída</Tag> },
  { title: 'Descrição', dataIndex: 'descricao', key: 'descricao' },
  { title: 'Valor (Kz)', dataIndex: 'valor', key: 'valor', render: v => v.toLocaleString() },
  { title: 'Data', dataIndex: 'data', key: 'data' },
];

const MovimentosTesouraria = () => {
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();
  const [movimentos, setMovimentos] = useState(mockMovimentos);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroData, setFiltroData] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  const handleNovo = () => setShowModal(true);
  const handleOk = () => {
    form.validateFields().then(values => {
      setMovimentos([
        ...movimentos,
        {
          id: Date.now(),
          ...values,
          data: values.data.format('YYYY-MM-DD'),
          tipo: values.tipo,
          valor: Number(values.valor),
        },
      ]);
      setShowModal(false);
      form.resetFields();
      messageApi.success('Movimento adicionado!');
    });
  };
  const handleCancel = () => setShowModal(false);

  const movimentosFiltrados = movimentos.filter(mov =>
    (!filtroTipo || mov.tipo === filtroTipo) &&
    (!filtroData || mov.data === filtroData.format('YYYY-MM-DD'))
  );

  return (
    <div>
      {contextHolder}
      <h2>Movimentos de Tesouraria</h2>
      <Row gutter={8} style={{ marginBottom: 16 }}>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={handleNovo}>Novo Movimento</Button></Col>
        <Col><Select placeholder="Tipo" allowClear style={{ width: 120 }} onChange={setFiltroTipo}><Option value="entrada">Entrada</Option><Option value="saida">Saída</Option></Select></Col>
        <Col><DatePicker placeholder="Data" onChange={setFiltroData} /></Col>
        <Col><Button icon={<SearchOutlined />} onClick={() => {}}>Filtrar</Button></Col>
        <Col><Button icon={<DownloadOutlined />} onClick={() => messageApi.info('Exportação mockada!')}>Exportar</Button></Col>
      </Row>
      <Table dataSource={movimentosFiltrados} columns={colunasMovimentos} rowKey="id" pagination={{ pageSize: 8 }} />
      <Modal open={showModal} onCancel={handleCancel} onOk={handleOk} title="Novo Movimento">
        <Form form={form} layout="vertical">
          <Form.Item name="tipo" label="Tipo" rules={[{ required: true, message: 'Selecione o tipo' }]}>
            <Select placeholder="Tipo"><Option value="entrada">Entrada</Option><Option value="saida">Saída</Option></Select>
          </Form.Item>
          <Form.Item name="descricao" label="Descrição" rules={[{ required: true, message: 'Informe a descrição' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="valor" label="Valor (Kz)" rules={[{ required: true, message: 'Informe o valor' }]}>
            <Input type="number" min={1} />
          </Form.Item>
          <Form.Item name="data" label="Data" rules={[{ required: true, message: 'Informe a data' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MovimentosTesouraria; 