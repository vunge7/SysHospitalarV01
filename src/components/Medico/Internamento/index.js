import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';

const Internamento = () => {
  const [internamentos, setInternamentos] = useState([
    { id: 1, paciente: 'João Silva', dataEntrada: '2024-06-01', leito: '101A', motivo: 'Pneumonia' },
    { id: 2, paciente: 'Maria Souza', dataEntrada: '2024-06-02', leito: '102B', motivo: 'Fratura' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();

  const handleNovo = () => setShowModal(true);
  const handleOk = () => {
    form.validateFields().then(values => {
      setInternamentos([
        ...internamentos,
        { id: Date.now(), ...values, dataEntrada: values.dataEntrada.format('YYYY-MM-DD') }
      ]);
      setShowModal(false);
      form.resetFields();
      message.success('Internamento registrado!');
    });
  };

  const columns = [
    { title: 'Paciente', dataIndex: 'paciente', key: 'paciente' },
    { title: 'Data de Entrada', dataIndex: 'dataEntrada', key: 'dataEntrada' },
    { title: 'Leito', dataIndex: 'leito', key: 'leito' },
    { title: 'Motivo', dataIndex: 'motivo', key: 'motivo' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h2>Internamento</h2>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleNovo} style={{ marginBottom: 16 }}>Novo Internamento</Button>
      <Table dataSource={internamentos} columns={columns} rowKey="id" pagination={{ pageSize: 8 }} />
      <Modal open={showModal} onCancel={() => setShowModal(false)} onOk={handleOk} title="Novo Internamento">
        <Form form={form} layout="vertical">
          <Form.Item name="paciente" label="Paciente" rules={[{ required: true, message: 'Informe o paciente' }]}> <Input /> </Form.Item>
          <Form.Item name="dataEntrada" label="Data de Entrada" rules={[{ required: true, message: 'Informe a data' }]}> <DatePicker style={{ width: '100%' }} /> </Form.Item>
          <Form.Item name="leito" label="Leito" rules={[{ required: true, message: 'Informe o leito' }]}> <Input /> </Form.Item>
          <Form.Item name="motivo" label="Motivo" rules={[{ required: true, message: 'Informe o motivo' }]}> <Input /> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Internamento; 