import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Menu, Layout } from 'antd';
import BemPatrimonialList from './bens-patrimoniais/components/BemPatrimonialList';
import BemPatrimonialForm from './bens-patrimoniais/components/BemPatrimonialForm';
import CategoriaBemList from './categorias-bens/components/CategoriaBemList';
import CategoriaBemForm from './categorias-bens/components/CategoriaBemForm';
import LocalizacaoList from './localizacoes/components/LocalizacaoList';
import LocalizacaoForm from './localizacoes/components/LocalizacaoForm';
import ManutencaoList from './manutencoes/components/ManutencaoList';
import ManutencaoForm from './manutencoes/components/ManutencaoForm';
import MovimentacaoList from './movimentacoes/components/MovimentacaoList';
import MovimentacaoForm from './movimentacoes/components/MovimentacaoForm';
import UsuarioList from './usuarios/components/UsuarioList';
import UsuarioForm from './usuarios/components/UsuarioForm';
import DepreciacaoList from './depreciacoes/components/DepreciacaoList';
import DepreciacaoForm from './depreciacoes/components/DepreciacaoForm';
import Cabecario from '../../components/Cabecario';
import Rodape from '../../components/Rodape';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    AppstoreAddOutlined,
    EnvironmentOutlined,
    ToolOutlined,
    SwapOutlined,
    UserOutlined,
    CalculatorOutlined,
    PoweroffOutlined,
} from '@ant-design/icons';
import './style.css';
import { AuthContext } from '../../contexts/auth';

const { Sider, Content } = Layout;

function PainelPatrimonio() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [collapsed, setCollapsed] = useState(false);
    const [menu, setMenu] = useState([]);
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    // Configuração do menu com ícones
    useEffect(() => {
        const items = [
            {
                key: 'dashboard',
                icon: <DashboardOutlined />,
                label: 'Dashboard',
            },
            {
                key: 'bens-patrimoniais',
                icon: <AppstoreAddOutlined />,
                label: 'Bens Patrimoniais',
            },
            {
                key: 'categorias-bens',
                icon: <AppstoreAddOutlined />,
                label: 'Categorias de Bens',
            },
            {
                key: 'localizacoes',
                icon: <EnvironmentOutlined />,
                label: 'Localizações',
            },
            {
                key: 'manutencoes',
                icon: <ToolOutlined />,
                label: 'Manutenções',
            },
            {
                key: 'movimentacoes',
                icon: <SwapOutlined />,
                label: 'Movimentações',
            },
            {
                key: 'usuarios',
                icon: <UserOutlined />,
                label: 'Usuários',
            },
            {
                key: 'depreciacoes',
                icon: <CalculatorOutlined />,
                label: 'Depreciações',
            },
            {
                key: 'sair',
                icon: <PoweroffOutlined />,
                label: 'Sair',
                danger: true,
            },
        ];
        setMenu([...items]);
    }, []);

    const handleTabClick = ({ key }) => {
        setActiveTab(key);
        if (key === 'sair') {
            logout();
        }
    };

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    return (
        <Layout className="min-h-screen bg-white">
            <Cabecario />
            <Layout>
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={toggleCollapsed}
                    trigger={null}
                    className="bg-white shadow-md"
                    width={256}
                    breakpoint="lg"
                    collapsedWidth={80}
                >
                    <Button
                        type="primary"
                        onClick={toggleCollapsed}
                        className="m-4 bg-blue-600 hover:bg-blue-700"
                    >
                        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    </Button>
                    <Menu
                        onClick={handleTabClick}
                        selectedKeys={[activeTab]}
                        mode="inline"
                        theme="light"
                        inlineCollapsed={collapsed}
                        items={menu}
                        className="sidebar-menu"
                    />
                </Sider>
                <Layout>
                    <Content className="p-6 bg-white">
                        {activeTab === 'dashboard' && (
                            <div className="text-center p-4">
                                <h2 className="text-2xl font-bold text-gray-800">Dashboard - Visão Geral do Patrimônio</h2>
                                <p className="text-gray-600">Bem-vindo ao sistema de gerenciamento de patrimônio hospitalar.</p>
                            </div>
                        )}
                        {activeTab === 'bens-patrimoniais' && <BemPatrimonialList />}
                        {activeTab === 'categorias-bens' && <CategoriaBemList />}
                        {activeTab === 'localizacoes' && <LocalizacaoList />}
                        {activeTab === 'manutencoes' && <ManutencaoList />}
                        {activeTab === 'movimentacoes' && <MovimentacaoList />}
                        {activeTab === 'usuarios' && <UsuarioList />}
                        {activeTab === 'depreciacoes' && <DepreciacaoList />}
                    </Content>
                </Layout>
            </Layout>
            <Rodape />
        </Layout>
    );
}

export default PainelPatrimonio;