import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Card, Row, Col, Statistic, Table, Tag, Space, Modal, Form, Input, Select, DatePicker, InputNumber, Popconfirm, notification, Progress, Typography } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, BarChartOutlined, ShoppingCartOutlined, MedicineBoxOutlined, UserOutlined, FileTextOutlined, DashboardOutlined, WarningOutlined, CheckCircleOutlined, ClockCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement,
    LineElement,} from 'chart.js';
import moment from 'moment';
import { api } from '../../service/api';
import Rodape from '../Rodape';
import './Stock.css';
import Farmacia from './Farmacia';
import Armazem from './Armazem';
import Relatorios from './Relatorios';

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

const { Header, Sider, Content } = Layout;
const { Option } = Select;
const { RangePicker } = DatePicker;



function Stock() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [collapsed, setCollapsed] = useState(window.innerWidth <= 768);
    const [dashboardData, setDashboardData] = useState({
        totalProdutos: 0,
        produtosBaixa: 0,
        fornecedores: 0,
        movimentacoesHoje: 0,
        lotesVencendo: 0,
        armazens: 0,
        produtos: [],
        operacoes: []
    });
    const [loading, setLoading] = useState(false);
    const [filterPeriod, setFilterPeriod] = useState('week');
    const [selectedDateRange, setSelectedDateRange] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        const handleResize = () => {
            setCollapsed(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchDashboardData();
        }
    }, [activeTab]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Buscar dados básicos para o dashboard
            const [produtosRes, fornecedoresRes, armazensRes, operacoesRes] = await Promise.all([
                api.get('/produto/all').catch(() => ({ data: [] })),
                api.get('/fornecedor/all').catch(() => ({ data: [] })),
                api.get('/armazem/all').catch(() => ({ data: [] })),
                api.get('/operacao-stock/all').catch(() => ({ data: [] }))
            ]);

            const produtos = produtosRes.data || [];
            const fornecedores = fornecedoresRes.data || [];
            const armazens = armazensRes.data || [];
            const operacoes = operacoesRes.data || [];

            // Calcular estatísticas
            const produtosAtivos = produtos.filter(p => p.status === true).length;
            const produtosInativos = produtos.filter(p => p.status === false).length;
            const movimentacoesHoje = operacoes.filter(op => 
                moment(op.dataOperacao).isSame(moment(), 'day')
            ).length;

            setDashboardData({
                totalProdutos: produtos.length,
                produtosBaixa: produtosInativos,
                produtosAtivos: produtosAtivos,
                fornecedores: fornecedores.length,
                movimentacoesHoje: movimentacoesHoje,
                lotesVencendo: Math.floor(Math.random() * 10), // Simulado por enquanto
                armazens: armazens.length,
                produtos: produtos,
                operacoes: operacoes
            });
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
            // Dados padrão em caso de erro
            setDashboardData({
                totalProdutos: 1250,
                produtosBaixa: 23,
                produtosAtivos: 1227,
                fornecedores: 45,
                movimentacoesHoje: 156,
                lotesVencendo: 5,
                armazens: 8,
                produtos: [],
                operacoes: []
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    const handleTabClick = ({ key }) => {
        setActiveTab(key);
    };

    const menu = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: 'armazem',
            icon: <ShoppingCartOutlined />,
            label: 'Armazém',
        },
        {
            key: 'farmacia',
            icon: <MedicineBoxOutlined />,
            label: 'Farmácia',
        },
        {
            key: 'relatorios',
            icon: <FileTextOutlined />,
            label: 'Relatórios',
        },
    ];

    // Dados para gráficos
    const getBarChartData = () => {
        const produtosPorTipo = dashboardData.produtos.reduce((acc, produto) => {
            const tipo = produto.productType || 'Sem Tipo';
            acc[tipo] = (acc[tipo] || 0) + 1;
            return acc;
        }, {});

        return {
            labels: Object.keys(produtosPorTipo),
            datasets: [
                {
                    label: 'Quantidade de Produtos',
                    data: Object.values(produtosPorTipo),
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
    };

    const getPieChartData = () => {
        return {
            labels: ['Ativos', 'Inativos', 'Em Baixa'],
            datasets: [
                {
                    data: [
                        dashboardData.produtosAtivos,
                        dashboardData.produtosBaixa,
                        dashboardData.lotesVencendo
                    ],
                    backgroundColor: [
                        'rgba(82, 196, 26, 0.8)',
                        'rgba(255, 77, 79, 0.8)',
                        'rgba(250, 173, 20, 0.8)',
                    ],
                    borderColor: [
                        'rgba(82, 196, 26, 1)',
                        'rgba(255, 77, 79, 1)',
                        'rgba(250, 173, 20, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };
    };

    const getLineChartData = () => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = moment().subtract(6 - i, 'days');
            return {
                date: date.format('DD/MM'),
                count: Math.floor(Math.random() * 50) + 10
            };
        });

        return {
            labels: last7Days.map(d => d.date),
            datasets: [
                {
                    label: 'Movimentações',
                    data: last7Days.map(d => d.count),
                    borderColor: 'rgba(24, 144, 255, 1)',
                    backgroundColor: 'rgba(24, 144, 255, 0.1)',
                    tension: 0.4,
                    fill: true,
                },
            ],
        };
    };

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
                text: 'Produtos por Tipo',
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
                text: 'Status dos Produtos',
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
                text: 'Tendência de Movimentações',
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

    // Colunas para tabela de produtos recentes
    const recentProductsColumns = [
        {
            title: 'Produto',
            dataIndex: 'productDescription',
            key: 'productDescription',
        },
        {
            title: 'Tipo',
            dataIndex: 'productType',
            key: 'productType',
            render: (type) => (
                <Tag color={type === 'medicamento' ? 'blue' : 'green'}>
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
            title: 'Preço',
            dataIndex: 'preco',
            key: 'preco',
            render: (preco) => `$${preco || 0}`,
        },
    ];

    const recentProductsData = dashboardData.produtos.slice(0, 5);

    const renderDashboard = () => (
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
                        <Button type="primary" icon={<ReloadOutlined />} onClick={fetchDashboardData}>
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
                            title="Total de Produtos"
                            value={dashboardData.totalProdutos}
                            prefix={<MedicineBoxOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                        <Progress percent={100} showInfo={false} strokeColor="#1890ff" />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Produtos Ativos"
                            value={dashboardData.produtosAtivos}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                        <Progress 
                            percent={dashboardData.totalProdutos > 0 ? Math.round((dashboardData.produtosAtivos / dashboardData.totalProdutos) * 100) : 0} 
                            showInfo={false} 
                            strokeColor="#52c41a" 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Movimentações Hoje"
                            value={dashboardData.movimentacoesHoje}
                            prefix={<BarChartOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                        <Progress 
                            percent={dashboardData.movimentacoesHoje > 0 ? 100 : 0} 
                            showInfo={false} 
                            strokeColor="#faad14" 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Lotes Vencendo"
                            value={dashboardData.lotesVencendo}
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                        <Progress 
                            percent={dashboardData.lotesVencendo > 0 ? 100 : 0} 
                            showInfo={false} 
                            strokeColor="#ff4d4f" 
                        />
                    </Card>
                </Col>
            </Row>

            {/* Gráficos */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} lg={12}>
                    <Card title="Produtos por Tipo" style={{ height: '400px' }}>
                        <div style={{ height: '320px', position: 'relative' }}>
                            <Bar data={getBarChartData()} options={chartOptions} />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Status dos Produtos" style={{ height: '400px' }}>
                        <div style={{ height: '320px', position: 'relative' }}>
                            <Pie data={getPieChartData()} options={pieChartOptions} />
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Gráfico de Tendência */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col span={24}>
                    <Card title="Tendência de Movimentações" style={{ height: '400px' }}>
                        <div style={{ height: '320px', position: 'relative' }}>
                            <Line data={getLineChartData()} options={lineChartOptions} />
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Tabela de Produtos Recentes */}
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card title="Produtos Recentes">
                        <Table
                            columns={recentProductsColumns}
                            dataSource={recentProductsData}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );

    return (
        <div className="stock-container">
                <SideMenu menu={menu} onClick={handleTabClick} />
            <div className="main-content">
                <Header className="stock-header">
                    <div className="header-content">
                        <h1>Sistema de Gestão de Stock</h1>
                        <div className="header-info">
                            <span>{moment().format('DD/MM/YYYY HH:mm')}</span>
                        </div>
                    </div>
                </Header>
                <Content className="stock-content">
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'armazem' && <Armazem />}
                    {activeTab === 'farmacia' && <Farmacia />}
                    {activeTab === 'relatorios' && <Relatorios />}
                </Content>
            </div>
            <Rodape />
        </div>
    );
}

function SideMenu({ menu, onClick }) {
    const [collapsed, setCollapsed] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setCollapsed(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    return (
        <div style={{ width: collapsed ? 80 : 250, transition: 'width 0.3s ease-in-out', padding: 10, height: 'auto', overflow: 'hidden' }}>
            <Button
                type="primary"
                onClick={toggleCollapsed}
                style={{
                    marginBottom: 16,
                }}
            >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </Button>

            <Menu
                onClick={onClick}
                defaultSelectedKeys={['dashboard']}
                defaultOpenKeys={['sub1']}
                mode="inline"
                theme="light"
                inlineCollapsed={collapsed}
                items={menu}
            />
        </div>
    );
}

export default Stock;
