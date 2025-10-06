import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Menu } from 'antd';
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

function PainelPatrimonio() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [menu, setMenu] = useState([]);
    const navigate = useNavigate();

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
            navigate('/logout'); // Ajuste conforme sua lógica de logout
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100vh' }}>
            <Cabecario />
            <div style={{ width: 'auto', display: 'flex', flexDirection: 'row', flex: 1 }}>
                <SideMenu menu={menu} onClick={handleTabClick} />
                <Content>
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

function Content({ children }) {
    return <div style={{ marginTop: 10, marginLeft: 50, width: '100%' }}>{children}</div>;
}

export default PainelPatrimonio;