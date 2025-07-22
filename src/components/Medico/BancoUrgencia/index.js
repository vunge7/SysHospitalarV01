import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';

const BancoUrgencia = () => {
  const [atendimentos, setAtendimentos] = useState([
    { id: 1, paciente: 'Carlos Lima', data: '2024-06-10', motivo: 'Dor abdominal' },
    { id: 2, paciente: 'Ana Paula', data: '2024-06-11', motivo: 'Trauma' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();

  const handleNovo = () => setShowModal(true);
  const handleOk = () => {
    form.validateFields().then(values => {
      setAtendimentos([
        ...atendimentos,
        { id: Date.now(), ...values, data: values.data.format('YYYY-MM-DD') }
      ]);
      setShowModal(false);
      form.resetFields();
      message.success('Atendimento registrado!');
    });
  };

  const columns = [
    { title: 'Paciente', dataIndex: 'paciente', key: 'paciente' },
    { title: 'Data', dataIndex: 'data', key: 'data' },
    { title: 'Motivo', dataIndex: 'motivo', key: 'motivo' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h2>Banco de Urgência</h2>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleNovo} style={{ marginBottom: 16 }}>Novo Atendimento</Button>
      <Table dataSource={atendimentos} columns={columns} rowKey="id" pagination={{ pageSize: 8 }} />
      <Modal open={showModal} onCancel={() => setShowModal(false)} onOk={handleOk} title="Novo Atendimento">
        <Form form={form} layout="vertical">
          <Form.Item name="paciente" label="Paciente" rules={[{ required: true, message: 'Informe o paciente' }]}> <Input /> </Form.Item>
          <Form.Item name="data" label="Data" rules={[{ required: true, message: 'Informe a data' }]}> <DatePicker style={{ width: '100%' }} /> </Form.Item>
          <Form.Item name="motivo" label="Motivo" rules={[{ required: true, message: 'Informe o motivo' }]}> <Input /> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BancoUrgencia; 