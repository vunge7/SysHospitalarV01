import React from 'react';
import { Card, Typography, Row, Col, Form, Input, Button, Space } from 'antd';
import './PacienteForm.css';

const { Title } = Typography;

const PacienteForm = ({ onSubmit, initialValues, loading }) => {
  return (
    <div className="paciente-form-container">
      <Card className="paciente-form-card" bordered>
        <Title level={4} className="paciente-form-title">Cadastro de Paciente</Title>
        <Form
          layout="vertical"
          initialValues={initialValues}
          onFinish={onSubmit}
          className="paciente-form"
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Nome Completo"
                name="nome"
                rules={[{ required: true, message: 'Informe o nome do paciente' }]}
              >
                <Input placeholder="Nome do paciente" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Data de Nascimento"
                name="dataNascimento"
                rules={[{ required: true, message: 'Informe a data de nascimento' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>
          {/* ...outros campos... */}
          <Row justify="end">
            <Col>
              <Space>
                <Button type="default" htmlType="reset" disabled={loading}>
                  Limpar
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Salvar
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default PacienteForm;