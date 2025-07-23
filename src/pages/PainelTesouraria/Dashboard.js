import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

function MinusIcon() {
  return <span style={{ fontWeight: 'bold', color: '#cf1322' }}>-</span>;
}

const DashboardTesouraria = () => {
  const totalEntradas = 120000;
  const totalSaidas = 80000;
  const saldo = totalEntradas - totalSaidas;
  const fechosHoje = 2;
  return (
    <div>
      <h2 style={{marginBottom: 24}}>Dashboard Tesouraria</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Entradas (Kz)" value={totalEntradas} valueStyle={{ color: '#3f8600' }} prefix={<PlusOutlined />} /></Card></Col>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Saídas (Kz)" value={totalSaidas} valueStyle={{ color: '#cf1322' }} prefix={<MinusIcon />} /></Card></Col>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Saldo Atual (Kz)" value={saldo} valueStyle={{ color: saldo >= 0 ? '#3f8600' : '#cf1322' }} /></Card></Col>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Fechos Hoje" value={fechosHoje} /></Card></Col>
      </Row>
      <Card title="Resumo Diário" style={{ marginTop: 24 }}>
        <p>Entradas: {totalEntradas} Kz | Saídas: {totalSaidas} Kz | Saldo: {saldo} Kz</p>
        <p>Última atualização: {new Date().toLocaleString()}</p>
      </Card>
    </div>
  );
};

export default DashboardTesouraria; 