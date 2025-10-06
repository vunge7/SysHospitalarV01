import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Menu } from 'antd';
import { api } from '../../service/api';
import GraficoAgenda from './GraficoAgenda';
import NovaAgenda from './NovaAgenda';
import ListarAgenda from './ListarAgenda';
import './Agenda.css';

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
} from '@ant-design/icons';

function PainelAgenda() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [agendas, setAgendas] = useState([]);
    const [linhasAgenda, setLinhasAgenda] = useState([]);
    const [formularios, setFormularios] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [pessoas, setPessoas] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [consultas, setConsultas] = useState([]);
    const [menu, setMenu] = useState([]);
    const navigate = useNavigate();

    // Funções de busca de dados (mantidas iguais)
    const fetchAgendas = async () => {
        try {
            const response = await api.get('agenda/all');
            setAgendas(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Erro ao buscar agendas:', error);
        }
    };

    const fetchLinhasAgenda = async () => {
        try {
            const response = await api.get('linhaagenda/all');
            setLinhasAgenda(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Erro ao buscar linhas da agenda:', error);
        }
    };

    const fetchFuncionarios = async () => {
        try {
            const response = await api.get('funcionario/all');
            setFuncionarios(response.data);
        } catch (error) {
            console.error('Erro ao buscar funcionários:', error);
        }
    };

    const fetchPessoas = async () => {
        try {
            const response = await api.get('pessoa/all');
            setPessoas(response.data);
        } catch (error) {
            console.error('Erro ao buscar pessoas:', error);
        }
    };

    const fetchPacientes = async () => {
        try {
            const response = await api.get('paciente/all');
            setPacientes(response.data);
        } catch (error) {
            console.error('Erro ao buscar pacientes:', error);
        }
    };

    const fetchConsultas = async () => {
        try {
            const response = await api.get('consulta/all');
            setConsultas(response.data);
        } catch (error) {
            console.error('Erro ao buscar consultas:', error);
        }
    };

    const fetchAllData = async () => {
        await Promise.all([
            fetchAgendas(),
            fetchLinhasAgenda(),
            fetchFuncionarios(),
            fetchPessoas(),
            fetchPacientes(),
            fetchConsultas(),
        ]);
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // Configuração do menu com ícones
    useEffect(() => {
        const items = [
            {
                key: 'dashboard',
                icon: <DashboardOutlined />,
                label: 'Dashboard',
            },
            {
                key: 'nova-agenda',
                icon: <UserAddOutlined />,
                label: 'Nova Agenda',
            },
            {
                key: 'listar-agenda',
                icon: <UnorderedListOutlined />,
                label: 'Listar Agenda',
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
        if (key !== 'nova-agenda') {
            setFormularios([]);
        }
        if (key === 'sair') {
            navigate('/logout'); // Ajuste conforme sua lógica de logout
        }
    };

    return (
        <div className="agenda-container">
            <Cabecario />
            <div style={{ display: 'flex', flex: 1 }}>
                <SideMenu menu={menu} onClick={handleTabClick} />
                <Content>
                    {activeTab === 'nova-agenda' && (
                        <NovaAgenda
                            formularios={formularios}
                            setFormularios={setFormularios}
                            funcionarios={funcionarios}
                            pessoas={pessoas}
                            pacientes={pacientes}
                            consultas={consultas}
                            agendas={agendas}
                            setLinhasAgenda={setLinhasAgenda}
                            setActiveTab={setActiveTab}
                            fetchAllData={fetchAllData}
                        />
                    )}
                    {activeTab === 'listar-agenda' && (
                        <ListarAgenda
                            agendas={agendas}
                            linhasAgenda={linhasAgenda}
                            setAgendas={setAgendas}
                            setLinhasAgenda={setLinhasAgenda}
                            funcionarios={funcionarios}
                            pessoas={pessoas}
                            pacientes={pacientes}
                            consultas={consultas}
                            setFormularios={setFormularios}
                            setActiveTab={setActiveTab}
                            fetchAgendas={fetchAgendas}
                            fetchLinhasAgenda={fetchLinhasAgenda}
                            fetchAllData={fetchAllData}
                        />
                    )}
                    {activeTab === 'dashboard' && <GraficoAgenda />}
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
    return <div className="main-content">{children}</div>;
}

export default PainelAgenda;
