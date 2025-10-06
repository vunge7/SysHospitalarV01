import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Statistic, Progress, Table, Tag, Space, Button, DatePicker, Select } from 'antd';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { 
    FileTextOutlined, 
    CheckCircleOutlined, 
    ClockCircleOutlined, 
    ExclamationCircleOutlined,
    UserOutlined,
    MedicineBoxOutlined,
    CalendarOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import moment from 'moment';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const { RangePicker } = DatePicker;
const { Option } = Select;

const Dashboard = ({ examesProdutos, examesRequisitados, resultadosExames, linhasRequisicaoExame }) => {
    const [filterPeriod, setFilterPeriod] = useState('week');
    const [selectedDateRange, setSelectedDateRange] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    // Calcular estatísticas básicas
    const ativos = examesProdutos?.filter(exame => exame.status === true)?.length || 0;
    const inativos = examesProdutos?.filter(exame => exame.status === false)?.length || 0;
    const total = examesProdutos?.length || 0;

    // Calcular estatísticas de requisições
    const totalRequisicoes = examesRequisitados?.length || 0;
    const requisicoesPendentes = examesRequisitados?.filter(req => 
        req.status === 'PENDENTE' || req.estado === 'PENDENTE'
    )?.length || 0;
    const requisicoesFinalizadas = examesRequisitados?.filter(req => 
        req.status === 'FINALIZADO' || req.estado === 'FINALIZADO'
    )?.length || 0;

    // Calcular estatísticas de resultados
    const totalResultados = resultadosExames?.length || 0;
    const resultadosNormais = resultadosExames?.filter(res => 
        res.status === 'NORMAL' || res.estado === 'NORMAL'
    )?.length || 0;
    const resultadosAnormais = resultadosExames?.filter(res => 
        res.status === 'ANORMAL' || res.estado === 'ANORMAL'
    )?.length || 0;

    // Dados para gráfico de barras por tipo de exame
    const examesPorTipo = examesProdutos?.reduce((acc, exame) => {
        const tipo = exame.productType || 'Sem Tipo';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
    }, {}) || {};

    const barChartData = {
    labels: Object.keys(examesPorTipo),
    datasets: [
      {
                label: 'Quantidade de Exames',
        data: Object.values(examesPorTipo),
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // Dados para gráfico de pizza de status de requisições
    const pieChartData = {
        labels: ['Pendentes', 'Finalizadas', 'Em Andamento'],
        datasets: [
            {
                data: [
                    requisicoesPendentes,
                    requisicoesFinalizadas,
                    totalRequisicoes - requisicoesPendentes - requisicoesFinalizadas
                ],
                backgroundColor: [
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(40, 167, 69, 0.8)',
                    'rgba(23, 162, 184, 0.8)',
                ],
                borderColor: [
                    'rgba(255, 193, 7, 1)',
                    'rgba(40, 167, 69, 1)',
                    'rgba(23, 162, 184, 1)',
                ],
                borderWidth: 2,
            },
        ],
    };

    // Dados para gráfico de linha de tendência (últimos 7 dias)
    const getLast7Days = () => {
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            dates.push(moment().subtract(i, 'days').format('DD/MM'));
        }
        return dates;
    };

    const lineChartData = {
        labels: getLast7Days(),
        datasets: [
            {
                label: 'Requisições',
                data: [12, 19, 15, 25, 22, 30, 28],
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                tension: 0.4,
            },
            {
                label: 'Resultados',
                data: [10, 15, 12, 20, 18, 25, 23],
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                tension: 0.4,
      },
    ],
  };

    // Configurações dos gráficos
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    padding: 10,
                    usePointStyle: true,
                    font: {
                        size: 12
                    }
                }
            },
            title: {
                display: true,
                text: 'Estatísticas de Exames',
                font: {
                    size: 16
                }
            },
        },
        layout: {
            padding: {
                top: 10,
                bottom: 20
            }
        }
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 10,
                    usePointStyle: true,
                    font: {
                        size: 12
                    }
                }
            },
            title: {
                display: true,
                text: 'Status das Requisições',
                font: {
                    size: 16
                }
            },
        },
        layout: {
            padding: {
                top: 10,
                bottom: 20
            }
        }
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    padding: 10,
                    usePointStyle: true,
                    font: {
                        size: 12
                    }
                }
            },
            title: {
                display: true,
                text: 'Tendência dos Últimos 7 Dias',
                font: {
                    size: 16
                }
            },
        },
        layout: {
            padding: {
                top: 10,
                bottom: 20
            }
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    // Dados para tabela de exames recentes
    const recentExamsColumns = [
        {
            title: 'Exame',
            dataIndex: 'designacao',
            key: 'designacao',
        },
        {
            title: 'Tipo',
            dataIndex: 'productType',
            key: 'productType',
            render: (type) => (
                <Tag color={type === 'exame' ? 'blue' : 'green'}>
                    {type || 'N/A'}
                </Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status ? 'green' : 'red'}>
                    {status ? 'Ativo' : 'Inativo'}
                </Tag>
            ),
        },
        {
            title: 'Data Criação',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => moment(date).format('DD/MM/YYYY'),
        },
    ];

    const recentExamsData = examesProdutos?.slice(0, 5) || [];

  return (
        <div style={{ padding: '24px' }}>
            {/* Filtros */}
            <Card style={{ marginBottom: '24px' }}>
                <Row gutter={16} align="middle">
                    <Col span={6}>
                        <Select
                            value={filterPeriod}
                            onChange={setFilterPeriod}
                            style={{ width: '100%' }}
                        >
                            <Option value="today">Hoje</Option>
                            <Option value="week">Esta Semana</Option>
                            <Option value="month">Este Mês</Option>
                            <Option value="custom">Personalizado</Option>
                        </Select>
                    </Col>
                    <Col span={6}>
                        <RangePicker
                            value={selectedDateRange}
                            onChange={setSelectedDateRange}
                            style={{ width: '100%' }}
                            disabled={filterPeriod !== 'custom'}
                        />
                    </Col>
                    <Col span={6}>
                        <Select
                            value={filterStatus}
                            onChange={setFilterStatus}
                            style={{ width: '100%' }}
                        >
                            <Option value="all">Todos os Status</Option>
                            <Option value="active">Ativos</Option>
                            <Option value="inactive">Inativos</Option>
                        </Select>
                    </Col>
                    <Col span={6}>
                        <Button type="primary" icon={<ReloadOutlined />}>
                            Atualizar
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Estatísticas Principais */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total de Exames"
                            value={total}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                        <Progress percent={100} showInfo={false} strokeColor="#1890ff" />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
          <Card>
                        <Statistic
                            title="Exames Ativos"
                            value={ativos}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                        <Progress 
                            percent={total > 0 ? Math.round((ativos / total) * 100) : 0} 
                            showInfo={false} 
                            strokeColor="#52c41a" 
                        />
          </Card>
        </Col>
                <Col xs={24} sm={12} lg={6}>
          <Card>
                        <Statistic
                            title="Requisições Pendentes"
                            value={requisicoesPendentes}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                        <Progress 
                            percent={totalRequisicoes > 0 ? Math.round((requisicoesPendentes / totalRequisicoes) * 100) : 0} 
                            showInfo={false} 
                            strokeColor="#faad14" 
                        />
          </Card>
        </Col>
                <Col xs={24} sm={12} lg={6}>
          <Card>
                        <Statistic
                            title="Resultados Anormais"
                            value={resultadosAnormais}
                            prefix={<ExclamationCircleOutlined />}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                        <Progress 
                            percent={totalResultados > 0 ? Math.round((resultadosAnormais / totalResultados) * 100) : 0} 
                            showInfo={false} 
                            strokeColor="#ff4d4f" 
                        />
                    </Card>
                </Col>
            </Row>

            {/* Gráficos */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} lg={12}>
                    <Card title="Exames por Tipo" style={{ height: '400px' }}>
                        <div style={{ height: '320px', position: 'relative' }}>
                            <Bar data={barChartData} options={chartOptions} />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Status das Requisições" style={{ height: '400px' }}>
                        <div style={{ height: '320px', position: 'relative' }}>
                            <Pie data={pieChartData} options={pieChartOptions} />
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Gráfico de Tendência */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col span={24}>
                    <Card title="Tendência de Atividade" style={{ height: '400px' }}>
                        <div style={{ height: '320px', position: 'relative' }}>
                            <Line data={lineChartData} options={lineChartOptions} />
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Tabela de Exames Recentes */}
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card title="Exames Recentes">
                        <Table
                            columns={recentExamsColumns}
                            dataSource={recentExamsData}
                            pagination={false}
                            size="small"
                        />
      </Card>
                </Col>
            </Row>
    </div>
  );
};

export default Dashboard;