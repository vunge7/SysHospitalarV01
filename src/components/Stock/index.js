import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Menu, notification } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    DatabaseOutlined,
    MedicineBoxOutlined,
    FileTextOutlined,
    PoweroffOutlined,
} from '@ant-design/icons';
import { StockContext } from '../../contexts/StockContext';
import Armazem from './Armazem';
import Farmacia from './Farmacia';
import Relatorios from './Relatorios';
import Cabecario from '../Cabecario';
import Rodape from '../Rodape';
import './Stock.css';

function Stock() {
    const { error, loading } = useContext(StockContext);
    const [activeTab, setActiveTab] = useState('farmacia');
    const [menu, setMenu] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const items = [
            {
                key: 'dashboard',
                icon: <DashboardOutlined />,
                label: 'Dashboard',
            },
            {
                key: 'registro-armazem',
                icon: <DatabaseOutlined />,
                label: 'Registro de Armazém',
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
            {
                key: 'sair',
                icon: <PoweroffOutlined />,
                label: 'Sair',
                danger: true,
            },
        ];
        setMenu([...items]);
    }, []);

    useEffect(() => {
        if (error) {
            notification.error({
                message: 'Erro',
                description: error,
                placement: 'topRight',
            });
        }
    }, [error]);

    const handleTabClick = ({ key }) => {
        setActiveTab(key);
        if (key === 'sair') {
            navigate('/logout');
        }
    };

    const renderContent = () => {
        if (loading) return <p>Carregando...</p>;
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div>
                        <h2>Dashboard</h2>
                        <p>Bem-vindo ao painel de controle de stock.</p>
                    </div>
                );
            case 'registro-armazem':
                return <Armazem />;
            case 'farmacia':
                return <Farmacia />;
            case 'relatorios':
                return <Relatorios />;
            default:
                return (
                    <div>
                        <h2>Bem-vindo</h2>
                        <p>Selecione uma opção no menu.</p>
                    </div>
                );
        }
    };

    return (
        <div className="stock-container">
            <Cabecario />
            <div style={{ display: 'flex', flex: 1 }}>
                <SideMenu menu={menu} onClick={handleTabClick} />
                <Content>{renderContent()}</Content>
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
                defaultSelectedKeys={['farmacia']}
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

function Header() {
    return (
        <div
            style={{
                height: 80,
                backgroundColor: '#506175',
                color: '#FFF',
                marginBottom: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
            }}
        >
            Painel de Stock
        </div>
    );
}

function Footer() {
    return (
        <div
            style={{
                height: 60,
                backgroundColor: 'lightskyblue',
                color: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: 'bold',
            }}
        >
            Footer
        </div>
    );
}

export default Stock;
