import React, { useState } from 'react';
import { Button, Table, Modal, Form, Input, DatePicker, Row, Col, message } from 'antd';
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';

const mockFechos = [
  { id: 1, dataFecho: '2024-06-10', valorFecho: 10000, responsavel: 'Ana' },
  { id: 2, dataFecho: '2024-06-11', valorFecho: 12000, responsavel: 'Carlos' },
];

const colunasFechos = [
  { title: 'Data do Fecho', dataIndex: 'dataFecho', key: 'dataFecho' },
  { title: 'Valor (Kz)', dataIndex: 'valorFecho', key: 'valorFecho', render: v => v.toLocaleString() },
  { title: 'Responsável', dataIndex: 'responsavel', key: 'responsavel' },
];

const FechosTesouraria = () => {
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();
  const [fechos, setFechos] = useState(mockFechos);
  const [messageApi, contextHolder] = message.useMessage();

  const handleNovo = () => setShowModal(true);
  const handleOk = () => {
    form.validateFields().then(values => {
      setFechos([
        ...fechos,
        {
          id: Date.now(),
          ...values,
          dataFecho: values.dataFecho.format('YYYY-MM-DD'),
          valorFecho: Number(values.valorFecho),
        },
      ]);
      setShowModal(false);
      form.resetFields();
      messageApi.success('Fecho registrado!');
    });
  };
  const handleCancel = () => setShowModal(false);

  return (
    <div>
      {contextHolder}
      <h2>Fechos de Caixa</h2>
      <Row gutter={8} style={{ marginBottom: 16 }}>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={handleNovo}>Novo Fecho</Button></Col>
        <Col><Button icon={<DownloadOutlined />} onClick={() => messageApi.info('Exportação mockada!')}>Exportar</Button></Col>
      </Row>
      <Table dataSource={fechos} columns={colunasFechos} rowKey="id" pagination={{ pageSize: 8 }} />
      <Modal open={showModal} onCancel={handleCancel} onOk={handleOk} title="Novo Fecho de Caixa">
        <Form form={form} layout="vertical">
          <Form.Item name="dataFecho" label="Data do Fecho" rules={[{ required: true, message: 'Informe a data' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="valorFecho" label="Valor do Fecho (Kz)" rules={[{ required: true, message: 'Informe o valor' }]}>
            <Input type="number" min={1} />
          </Form.Item>
          <Form.Item name="responsavel" label="Responsável" rules={[{ required: true, message: 'Informe o responsável' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FechosTesouraria; 