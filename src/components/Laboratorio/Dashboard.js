import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard({ exames, tiposExame, artigos }) {
  // Contagem de exames por status
  const examesPendentes = exames.filter((e) => e.status === 'PENDENTE').length;
  const examesConcluidos = exames.filter((e) => e.status === 'CONCLUIDO').length;

  // Dados para o gráfico de exames por tipo
  const examesPorTipo = tiposExame.map((tipo) => ({
    label: tipo.nome,
    value: exames.filter((e) => e.tipoExameId === tipo.id).length,
  }));

  // Quantidade total de insumos disponíveis
  const insumosDisponiveis = artigos.reduce((sum, artigo) => sum + (artigo.quantidade || 0), 0);

  const chartData = {
    labels: examesPorTipo.map((e) => e.label),
    datasets: [
      {
        label: 'Exames Realizados',
        data: examesPorTipo.map((e) => e.value),
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
            <Statistic title="Exames Pendentes" value={examesPendentes} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Exames Concluídos" value={examesConcluidos} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Insumos Disponíveis" value={insumosDisponiveis} />
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