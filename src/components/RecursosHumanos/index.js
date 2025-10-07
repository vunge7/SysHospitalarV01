import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Menu } from 'antd';
import { api } from '../../service/api';
import Ficha from './Ficha'; // Alterado de Cadastrar para Ficha
import ListarRecursosHumanos from './ListarRecursosHumanos';
import './RecursosHumanos.css';
import Cabecario from '../Cabecario';
import Rodape from '../Rodape';

import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    UserAddOutlined,
    UnorderedListOutlined,
    UserOutlined,
    PoweroffOutlined,
} from '@ant-design/icons';
import { AuthContext } from '../../contexts/auth';

function RecursosHumanos() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [recursosHumanos, setRecursosHumanos] = useState([]);
    const [perfis, setPerfis] = useState([]);
    const [pessoas, setPessoas] = useState([]);
    const [menu, setMenu] = useState([]);
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    // Funções de busca de dados
    const fetchRecursosHumanos = async () => {
        try {
            const response = await api.get('recursoHumano/all');
            setRecursosHumanos(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (error) {
            console.error('Erro ao buscar recursos humanos:', error);
        }
    };

    const fetchPerfis = async () => {
        try {
            const response = await api.get('perfil/all');
            setPerfis(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Erro ao buscar perfis:', error);
        }
    };

    const fetchPessoas = async () => {
        try {
            const response = await api.get('pessoa/all');
            setPessoas(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Erro ao buscar pessoas:', error);
        }
    };

    const fetchAllData = async () => {
        await Promise.all([
            fetchRecursosHumanos(),
            fetchPerfis(),
            fetchPessoas(),
        ]);
    };

    useEffect(() => {
        fetchAllData();
    }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

    // Configuração do menu com ícones
    useEffect(() => {
        const items = [
            {
                key: 'dashboard',
                icon: <DashboardOutlined />,
                label: 'Dashboard',
            },
            {
                key: 'ficha', // Alterado de 'cadastrar' para 'ficha'
                icon: <UserAddOutlined />,
                label: 'Ficha', // Alterado de 'Cadastrar' para 'Ficha'
            },
            {
                key: 'listar-recursos-humanos',
                icon: <UnorderedListOutlined />,
                label: 'Listar Recursos Humanos',
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
        if (key === 'sair') {
            logout();
        }
    };

    return (
        <div className="recursos-humanos-container">
            <Cabecario />
            <div style={{ display: 'flex', flex: 1 }}>
                <SideMenu menu={menu} onClick={handleTabClick} />
                <Content>
                    {activeTab === 'ficha' && ( // Alterado de 'cadastrar' para 'ficha'
                        <Ficha
                            recursosHumanos={recursosHumanos}
                            perfis={perfis}
                            pessoas={pessoas}
                            setRecursosHumanos={setRecursosHumanos}
                            setActiveTab={setActiveTab}
                            fetchAllData={fetchAllData}
                        />
                    )}
                    {activeTab === 'listar-recursos-humanos' && (
                        <ListarRecursosHumanos
                            recursosHumanos={recursosHumanos}
                            perfis={perfis}
                            pessoas={pessoas}
                            setRecursosHumanos={setRecursosHumanos}
                            setActiveTab={setActiveTab}
                            fetchRecursosHumanos={fetchRecursosHumanos}
                            fetchAllData={fetchAllData}
                        />
                    )}
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
            Painel de Recursos Humanos
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

export default RecursosHumanos;
