import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard({ examesProdutos }) {
  const ativos = examesProdutos.filter(e => e.status === true || e.status === '1' || e.status === 1 || e.status === 'ATIVO').length;
  const inativos = examesProdutos.length - ativos;

  // Exames por tipo
  const examesPorTipo = {};
  examesProdutos.forEach(e => {
    const tipo = e.productType || 'Outro';
    examesPorTipo[tipo] = (examesPorTipo[tipo] || 0) + 1;
  });

  const chartData = {
    labels: Object.keys(examesPorTipo),
    datasets: [
      {
        label: 'Exames por Tipo',
        data: Object.values(examesPorTipo),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <div>
      <h2 className="section-title">Dashboard do Laboratório</h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="Exames Ativos" value={ativos} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Exames Inativos" value={inativos} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Total de Exames" value={examesProdutos.length} />
          </Card>
        </Col>
      </Row>
      <Card style={{ marginTop: 24 }}>
        <h3>Exames por Tipo</h3>
        <Bar data={chartData} options={{ responsive: true }} />
      </Card>
    </div>
  );
}

export default Dashboard;