import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Menu } from 'antd';
import NovoProduto from './NovoProduto';
import ListarProduto from './ListarProduto';
import Cabecario from '../../components/Cabecario';
import Rodape from '../../components/Rodape';


import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    UserAddOutlined,
    UnorderedListOutlined,
    UserOutlined,
    PoweroffOutlined,
    BookOutlined,
} from '@ant-design/icons';

function PainelProduto() {
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
                key: 'novo-produto',
                icon: <BookOutlined />,
                label: 'Novo Produto',
            },
            {
                key: 'listar-produto',
                icon: <UnorderedListOutlined />,
                label: 'Listar Produto',
            },
            {
                key: 'perfil',
                icon: <UserOutlined />,
                label: 'Perfil',
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
        if (key !== 'novo-produto') {
        }
        if (key === 'sair') {
            navigate('/logout'); // Ajuste conforme sua lógica de logout
        }
    };

    return (
        <div className="produto-container">
            <Cabecario />
            <div style={{ display: 'flex', flex: 1 }}>
                <SideMenu menu={menu} onClick={handleTabClick} />
                <Content>
                    {activeTab === 'novo-produto' && <NovoProduto />}
                    {activeTab === 'listar-produto' && <ListarProduto />}
                    {
                        activeTab === 'dashboard' && (
                            <div>Nada Pra Mostrar</div>
                        ) /*<GraficoProduto />*/
                    }
                    {activeTab === 'perfil' && (
                        <h2 className="section-title">Seu Perfil</h2>
                    )}
                    {activeTab === 'sair' && (
                        <h2 className="section-title">Logout</h2>
                    )}
                </Content>
            </div>
            <Rodape />
        </div>
    );
}

function SideMenu({ menu, onClick }) {
    const [collapsed, setCollapsed] = useState(false);

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    return (
        <div className="sidebar">
            <Button
                type="primary"
                onClick={toggleCollapsed}
                style={{ marginBottom: 16 }}
            >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </Button>
            <Menu
                onClick={onClick}
                defaultSelectedKeys={['dashboard']}
                mode="inline"
                theme="light"
                inlineCollapsed={collapsed}
                items={menu}
                className="sidebar-menu"
            />
        </div>
    );
}

function Content({ children }) {
    return <div className="main-content">{children}</div>;
}

export default PainelProduto;
