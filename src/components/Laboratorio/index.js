import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Menu, Layout, notification, Drawer } from 'antd';
import { StockContext } from '../../contexts/StockContext';
import Dashboard from './Dashboard';
import Exame from './Exame';
import Relatorio from './Relatorio';
import AvaliacaoExameRequisitado from './AvaliacaoExameRequisitado';
import './Laboratorio.css';
import './responsive.css';
import Cabecario from '../Cabecario';
import Rodape from '../Rodape';
import { api } from '../../service/api';

import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    ExperimentOutlined,
    FileTextOutlined,
    FileSearchOutlined,
    PoweroffOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content, Footer } = Layout;

// Dados fictícios
const initialExames = [
    {
        id: 1,
        tipoExameId: 1,
        estado: 'ATIVO',
        designacao: 'Hemograma Completo',
        unidade: 'unidade',
        composto: true,
        referencias: {
            Hemácias: { valor: '4.5-5.9', unidade: 'milhões/mm³' },
            Leucócitos: { valor: '4.5-11.0', unidade: 'mil/mm³' },
            Plaquetas: { valor: '150-450', unidade: 'mil/mm³' },
        },
        pacienteId: 1,
        medicoId: 1,
        status: 'CONCLUIDO',
        dataSolicitacao: '2025-06-01T10:00:00.000Z',
        dataColeta: '2025-06-01T09:00:00.000Z',
        resultado: {
            valor: { Hemácias: '5.0', Leucócitos: '7.2', Plaquetas: '300' },
            observacao: 'Valores dentro da normalidade',
            finalizado: true,
            dataFinalizacao: '2025-06-01T14:00:00.000Z',
        },
    },
    {
        id: 2,
        tipoExameId: 2,
        estado: 'ATIVO',
        designacao: 'Glicemia',
        unidade: 'mg/dL',
        composto: false,
        referencias: { Glicemia: { valor: '70-99', unidade: 'mg/dL' } },
        pacienteId: 2,
        medicoId: 2,
        status: 'PENDENTE',
        dataSolicitacao: '2025-06-02T09:30:00.000Z',
        dataColeta: null,
        resultado: null,
    },
    {
        id: 3,
        tipoExameId: 3,
        estado: 'ATIVO',
        designacao: 'Colesterol Total',
        unidade: 'mg/dL',
        composto: false,
        referencias: { Colesterol: { valor: '0-200', unidade: 'mg/dL' } },
        pacienteId: 3,
        medicoId: 1,
        status: 'CONCLUIDO',
        dataSolicitacao: '2025-06-03T11:00:00.000Z',
        dataColeta: '2025-06-03T10:00:00.000Z',
        resultado: {
            valor: { Colesterol: '180' },
            observacao: 'Nível normal',
            finalizado: true,
            dataFinalizacao: '2025-06-03T15:00:00.000Z',
        },
    },
    {
        id: 4,
        tipoExameId: 1,
        estado: 'ATIVO',
        designacao: 'Hemograma Parcial',
        unidade: 'unidade',
        composto: true,
        referencias: {
            Hemácias: { valor: '4.5-5.9', unidade: 'milhões/mm³' },
            Hemoglobina: { valor: '13.5-17.5', unidade: 'g/dL' },
        },
        pacienteId: 4,
        medicoId: 3,
        status: 'PENDENTE',
        dataSolicitacao: '2025-06-04T08:00:00.000Z',
        dataColeta: null,
        resultado: null,
    },
    {
        id: 5,
        tipoExameId: 4,
        estado: 'INATIVO',
        designacao: 'TSH',
        unidade: 'mIU/L',
        composto: false,
        referencias: { TSH: { valor: '0.4-4.0', unidade: 'mIU/L' } },
        pacienteId: 5,
        medicoId: 2,
        status: 'PENDENTE',
        dataSolicitacao: '2025-06-05T12:00:00.000Z',
        dataColeta: null,
        resultado: null,
    },
    {
        id: 6,
        tipoExameId: 5,
        estado: 'ATIVO',
        designacao: 'Ureia',
        unidade: 'mg/dL',
        composto: false,
        referencias: { Ureia: { valor: '10-50', unidade: 'mg/dL' } },
        pacienteId: 6,
        medicoId: 4,
        status: 'CONCLUIDO',
        dataSolicitacao: '2025-06-06T10:30:00.000Z',
        dataColeta: '2025-06-06T09:30:00.000Z',
        resultado: {
            valor: { Ureia: '25' },
            observacao: 'Dentro do esperado',
            finalizado: true,
            dataFinalizacao: '2025-06-06T16:00:00.000Z',
        },
    },
    {
        id: 7,
        tipoExameId: 1,
        estado: 'ATIVO',
        designacao: 'Hemograma Completo',
        unidade: 'unidade',
        composto: true,
        referencias: {
            Hemácias: { valor: '4.5-5.9', unidade: 'milhões/mm³' },
            Leucócitos: { valor: '4.5-11.0', unidade: 'mil/mm³' },
            Plaquetas: { valor: '150-450', unidade: 'mil/mm³' },
        },
        pacienteId: 7,
        medicoId: 5,
        status: 'PENDENTE',
        dataSolicitacao: '2025-06-07T09:00:00.000Z',
        dataColeta: null,
        resultado: null,
    },
    {
        id: 8,
        tipoExameId: 2,
        estado: 'ATIVO',
        designacao: 'Glicemia de Jejum',
        unidade: 'mg/dL',
        composto: false,
        referencias: { Glicemia: { valor: '70-99', unidade: 'mg/dL' } },
        pacienteId: 8,
        medicoId: 3,
        status: 'CONCLUIDO',
        dataSolicitacao: '2025-06-08T14:00:00.000Z',
        dataColeta: '2025-06-08T13:00:00.000Z',
        resultado: {
            valor: { Glicemia: '95' },
            observacao: 'Normal',
            finalizado: true,
            dataFinalizacao: '2025-06-08T17:00:00.000Z',
        },
    },
    {
        id: 9,
        tipoExameId: 3,
        estado: 'ATIVO',
        designacao: 'LDL Colesterol',
        unidade: 'mg/dL',
        composto: false,
        referencias: { LDL: { valor: '0-130', unidade: 'mg/dL' } },
        pacienteId: 9,
        medicoId: 4,
        status: 'PENDENTE',
        dataSolicitacao: '2025-06-09T11:30:00.000Z',
        dataColeta: null,
        resultado: null,
    },
    {
        id: 10,
        tipoExameId: 4,
        estado: 'ATIVO',
        designacao: 'T4 Livre',
        unidade: 'ng/dL',
        composto: false,
        referencias: { T4: { valor: '0.8-1.8', unidade: 'ng/dL' } },
        pacienteId: 10,
        medicoId: 5,
        status: 'PENDENTE',
        dataSolicitacao: '2025-06-10T13:00:00.000Z',
        dataColeta: null,
        resultado: null,
    },
];

const initialPacientes = [
    { id: 1, nome: 'Ana Silva' },
    { id: 2, nome: 'João Pereira' },
    { id: 3, nome: 'Maria Oliveira' },
    { id: 4, nome: 'Carlos Souza' },
    { id: 5, nome: 'Fernanda Costa' },
    { id: 6, nome: 'Lucas Almeida' },
    { id: 7, nome: 'Beatriz Santos' },
    { id: 8, nome: 'Rafael Lima' },
    { id: 9, nome: 'Juliana Mendes' },
    { id: 10, nome: 'Pedro Rocha' },
];

const initialTiposExame = [
    { id: 1, nome: 'Hemograma' },
    { id: 2, nome: 'Glicemia' },
    { id: 3, nome: 'Colesterol' },
    { id: 4, nome: 'Função Tireoidiana' },
    { id: 5, nome: 'Função Renal' },
    { id: 6, nome: 'Lipidograma' },
    { id: 7, nome: 'Exame de Urina' },
    { id: 8, nome: 'Função Hepática' },
    { id: 9, nome: 'PCR' },
    { id: 10, nome: 'Eletrolitos' },
];

const initialMedicos = [
    { id: 1, nome: 'Dr. Ricardo Mendes' },
    { id: 2, nome: 'Dra. Clara Ferreira' },
    { id: 3, nome: 'Dr. Eduardo Santos' },
    { id: 4, nome: 'Dra. Lívia Almeida' },
    { id: 5, nome: 'Dr. Marcelo Costa' },
    { id: 6, nome: 'Dra. Sofia Ribeiro' },
    { id: 7, nome: 'Dr. André Lima' },
    { id: 8, nome: 'Dra. Isabela Oliveira' },
    { id: 9, nome: 'Dr. Thiago Souza' },
    { id: 10, nome: 'Dra. Camila Pereira' },
];

const initialArtigos = [
    { id: 1, artigoNome: 'Tubo de Ensaio 5mL', quantidade: 100 },
    { id: 2, artigoNome: 'Seringa 10mL', quantidade: 50 },
    { id: 3, artigoNome: 'Reagente Hemograma', quantidade: 20 },
    { id: 4, artigoNome: 'Reagente Glicemia', quantidade: 30 },
    { id: 5, artigoNome: 'Reagente Colesterol', quantidade: 25 },
    { id: 6, artigoNome: 'Pipeta 1mL', quantidade: 200 },
    { id: 7, artigoNome: 'Tubo EDTA', quantidade: 80 },
    { id: 8, artigoNome: 'Reagente TSH', quantidade: 15 },
    { id: 9, artigoNome: 'Reagente Ureia', quantidade: 40 },
    { id: 10, artigoNome: 'Luvas Estéreis', quantidade: 500 },
];

const initialArmazens = [
    { id: 1, designacao: 'Laboratório Central' },
    { id: 2, designacao: 'Depósito Norte' },
    { id: 3, designacao: 'Sala de Exames 1' },
    { id: 4, designacao: 'Armazém de Reagentes' },
    { id: 5, designacao: 'Laboratório 2' },
    { id: 6, designacao: 'Depósito Sul' },
    { id: 7, designacao: 'Sala de Coleta' },
    { id: 8, designacao: 'Armazém de Suprimentos' },
    { id: 9, designacao: 'Laboratório 3' },
    { id: 10, designacao: 'Depósito de Emergência' },
];

function Laboratorio() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [exames, setExames] = useState(() => {
        const saved = localStorage.getItem('exames');
        return saved ? JSON.parse(saved) : initialExames;
    });
    const [pacientes, setPacientes] = useState(initialPacientes);
    const [tiposExame, setTiposExame] = useState(initialTiposExame);
    const [medicos, setMedicos] = useState(initialMedicos);
    const [artigos, setArtigos] = useState(initialArtigos);
    const [armazens, setArmazens] = useState(initialArmazens);
    const [examesRequisitados, setExamesRequisitados] = useState([]);
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const [examesProdutos, setExamesProdutos] = useState([]);
    const [resultadosExames, setResultadosExames] = useState([]);
    const [resultadoExames, setResultadoExames] = useState([]);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [requisicoesExame, setRequisicoesExame] = useState([]);
    const [linhasRequisicaoExame, setLinhasRequisicaoExame] = useState([]);

    // Consolidar todas as chamadas de API em um único useEffect
    useEffect(() => {
        const fetchAllInitialData = async () => {
            try {
                // Buscar requisições de exame
                const requisicoesRes = await api.get('/requisicaoexame/all/composto');
                setExamesRequisitados(Array.isArray(requisicoesRes.data) ? requisicoesRes.data : []);
                setRequisicoesExame(Array.isArray(requisicoesRes.data) ? requisicoesRes.data : []);

                // Buscar produtos de exame
                const produtosRes = await api.get('/produto/all');
                const produtos = Array.isArray(produtosRes.data)
                    ? produtosRes.data.filter(p => (p.productType || '').toLowerCase().includes('exame'))
                    : [];
                setExamesProdutos(produtos);

                // Buscar resultados de exames
                const resultadosRes = await api.get('/linharesultado/all');
                setResultadosExames(Array.isArray(resultadosRes.data) ? resultadosRes.data : []);

                // Buscar resultado de exames
                const resultadoExamesRes = await api.get('/resultado/all');
                setResultadoExames(Array.isArray(resultadoExamesRes.data) ? resultadoExamesRes.data : []);

                // Buscar linhas de requisição de exame
                const linhasRes = await api.get('/linharequisicaoexame/all');
                setLinhasRequisicaoExame(Array.isArray(linhasRes.data) ? linhasRes.data : []);

            } catch (error) {
                console.error('Erro ao buscar dados iniciais:', error);
                notification.error({
                    message: 'Erro ao carregar dados iniciais',
                    description: error.message,
                });
            }
        };

        fetchAllInitialData();
    }, []); // Executar apenas uma vez na montagem do componente
    
    // Persistir exames no localStorage apenas quando necessário
    useEffect(() => {
        if (exames.length > 0) {
            localStorage.setItem('exames', JSON.stringify(exames));
        }
    }, [exames]);



    // Funções de simulação da API
    const fetchExames = async () => {
        return { data: exames };
    };

    const fetchPacientes = async () => {
        return { data: pacientes };
    };

    const fetchTiposExame = async () => {
        return { data: tiposExame };
    };

    const fetchMedicos = async () => {
        return { data: medicos };
    };

    const fetchArtigos = async () => {
        console.log('Buscando artigos...');
        return { data: artigos };
    };

    const fetchArmazens = async () => {
        console.log('Buscando armazéns...');
        return { data: armazens };
    };

    const createExame = async (exame) => {
        console.log('Criando exame:', exame);
        const newExame = { ...exame, id: exames.length + 1 };
        setExames([...exames, newExame]);
        return { data: newExame };
    };

    const updateExame = async (id, updatedExame) => {
        console.log('Atualizando exame ID:', id, updatedExame);
        const index = exames.findIndex((exame) => exame.id === id);
        if (index !== -1) {
            const newExames = [...exames];
            newExames[index] = { ...newExames[index], ...updatedExame };
            setExames(newExames);
            return { data: newExames[index] };
        }
        throw new Error('Exame não encontrado');
    };

    const deleteExame = async (id) => {
        console.log('Excluindo exame ID:', id);
        const index = exames.findIndex((exame) => exame.id === id);
        if (index !== -1) {
            const newExames = exames.filter((exame) => exame.id !== id);
            setExames(newExames);
            return { data: exames[index] };
        }
        throw new Error('Exame não encontrado');
    };

    const fetchAllData = async () => {
        try {
            await Promise.all([
                fetchExames(),
                fetchPacientes(),
                fetchTiposExame(),
                fetchMedicos(),
                fetchArtigos(),
                fetchArmazens(),
            ]);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            notification.error({
                message: 'Erro ao carregar dados',
                description: error.message,
            });
        }
    };

    // Executar fetchAllData apenas uma vez na montagem
    useEffect(() => {
        fetchAllData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Configuração do menu com ícones
    const menuItems = [
        { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
        {
            key: 'exame',
            icon: <ExperimentOutlined />,
            label: 'Gestão de Exames',
        },
        {
            key: 'avaliacao',
            icon: <FileSearchOutlined />,
            label: 'Avaliação de Exames Requisitados',
        },
        { key: 'relatorio', icon: <FileTextOutlined />, label: 'Relatório' },
        {
            key: 'sair',
            icon: <PoweroffOutlined />,
            label: 'Sair',
            danger: true,
        },
    ];

    const handleTabClick = ({ key }) => {
        setActiveTab(key);
        if (key === 'sair') {
            navigate('/logout');
        }
    };

    // Otimizar o filtro de exames requisitados para evitar re-renderizações desnecessárias
    const examesRequisitadosFiltrados = useMemo(() => {
        return examesRequisitados.filter(r => !r.finalizado);
    }, [examesRequisitados]);

    const isMobile = window.innerWidth <= 768;

    // Deixar fetchExamesProdutos disponível para ser chamado após adicionar/editar exame
    const fetchExamesProdutos = async () => {
        try {
            const res = await api.get('/produto/all');
            const produtos = Array.isArray(res.data)
                ? res.data.filter(p => (p.productType || '').toLowerCase().includes('exame'))
                : [];
            setExamesProdutos(produtos);
        } catch (error) {
            console.error('Erro ao buscar produtos de exame:', error);
            setExamesProdutos([]);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100vh' }}>
            <Cabecario />
            <div style={{ width: 'auto', display: 'flex', flexDirection: 'row', flex: 1 }}>
                <SideMenu menu={menuItems} onClick={handleTabClick} />
                <MainContent>
                    {activeTab === 'dashboard' && (
                        <Dashboard
                            examesProdutos={examesProdutos}
                            examesRequisitados={examesRequisitados}
                            resultadosExames={resultadosExames}
                            linhasRequisicaoExame={linhasRequisicaoExame}
                        />
                    )}
                    {activeTab === 'exame' && (
                        <Exame
                            exames={exames}
                            tiposExame={tiposExame}
                            pacientes={pacientes}
                            medicos={medicos}
                            setExames={setExames}
                            fetchAllData={fetchAllData}
                            createExame={createExame}
                            updateExame={updateExame}
                            deleteExame={deleteExame}
                            fetchExamesProdutos={fetchExamesProdutos}
                        />
                    )}
                    {activeTab === 'avaliacao' && (
                        <AvaliacaoExameRequisitado
                            examesRequisitados={examesRequisitadosFiltrados}
                            setExamesRequisitados={setExamesRequisitados}
                            exames={exames}
                            pacientes={pacientes}
                            medicos={medicos}
                            tiposExame={tiposExame}
                            setExames={setExames}
                            fetchAllData={fetchAllData}
                            updateExame={updateExame}
                            deleteExame={deleteExame}
                        />
                    )}
                    {activeTab === 'relatorio' && (
                        <Relatorio
                            examesProdutos={examesProdutos}
                            resultadosExames={resultadosExames}
                            resultadoExames={resultadoExames}
                            requisicoesExame={requisicoesExame}
                            linhasRequisicaoExame={linhasRequisicaoExame}
                            pacientes={pacientes}
                            tiposExame={tiposExame}
                            artigos={artigos}
                            medicos={medicos}
                        />
                    )}
                </MainContent>
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

function MainContent({ children }) {
    return <div style={{ marginTop: 10, marginLeft: 50, width: '100%' }}>{children}</div>;
}

export default Laboratorio;
