import React, { useEffect, useState } from 'react';
import { api } from '../../../service/api';
import Receituario from '../Receituario';
import Procedimento from '../../Procedimento';
import Cid10 from '../../Cid10';
import BancoUrgencia from '../BancoUrgencia';
import Internamento from '../Internamento';
import { ConfigProvider } from 'antd';
import ptPT from 'antd/lib/locale/pt_PT';
import TextToSpeech from '../../TextToSpeech';
import { viewPdfGenerico, ModalTriagem, ModalFinalizarAtendimento } from '../../util/utilitarios';
import { toast } from 'react-toastify';
import {
    List, Button, Tabs, Form, message, Tooltip,
    Card, Row, Tag, Space, Avatar, Typography,
    Table, Input, Spin, Empty, Modal
} from 'antd';
import {
    MedicineBoxOutlined, CloseCircleOutlined, FileSearchOutlined,
    ClockCircleOutlined, UserOutlined, PlusOutlined, SearchOutlined, LoadingOutlined, XOutlined
} from '@ant-design/icons';
import { format } from 'date-fns';
import './Consulta.css';
import { useAuth } from '../../../hooks/auth';

const { Title, Text } = Typography;

function Consulta() {
    const { user } = useAuth();
    const [id, setId] = useState(0);
    const [data, setData] = useState([]);
    const [dataCIDInicial, setdataCIDInicial] = useState([]);
    const [dataCIDFinal, setdataCIDFinal] = useState([]);
    const [nomePaciente, setNomePaciente] = useState('');
    const [exameFisico, setExameFisico] = useState('');
    const [motivoConsulta, setMotivoConsulta] = useState('');
    const [historiaClinica, setHistoriaClinica] = useState('');
    const [receita, setReceita] = useState('');
    const [idInscricao, setIdInscricao] = useState(0);
    const [isModalConsulta, setIsModalConsulta] = useState(false);
    const [isConsultaCriada, setIsConsultaCriada] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formConsulta] = Form.useForm();
    const [listaExamesRequisitado, setListaExamesRequisitado] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [isModalTriagem, setIsModalTriagem] = useState(false);
    const [isModalFinalizarAtendimento, setIsModalFinalizarAtendimento] = useState(false);
    const [inscricaoIdTriagem, setInscricaoIdTriagem] = useState(null);

    // Função para obter empresaId
    const getEmpresaId = () => {
        const userFromStorage = JSON.parse(localStorage.getItem('@sysHospitalarPRO') || '{}');
        return user?.filialSelecionada?.id || userFromStorage?.filialSelecionada?.id;
    };

    // === MODAL ADICIONAR EXAME ===
    const [isModalExameOpen, setIsModalExameOpen] = useState(false);
    const [searchExame, setSearchExame] = useState('');
    const [exameOptions, setExameOptions] = useState([]);
    const [loadingExames, setLoadingExames] = useState(false);
    const [todosExames, setTodosExames] = useState([]);

    // Buscar exames da API
    useEffect(() => {
        const fetchExames = async () => {
            try {
                const response = await api.get('produto/all');
                const exames = response.data || [];
                console.log('Todos os produtos:', exames.length, exames.slice(0, 3));
                
                // Verificar se há produtos com productGroup
                const comGroup = exames.filter(p => p.productGroup);
                console.log('Produtos com productGroup:', comGroup.length, comGroup.slice(0, 3));
                
                // Filtrar apenas produtos que são exames (usando mesmo filtro do Exame.js)
                const examesFiltrados = exames.filter(produto => 
                    produto.productGroup === 'Exames'
                ).map(produto => ({
                    id: produto.id,
                    nome: produto.productDescription || produto.nome || produto.designacao || 'N/A',
                    categoria: produto.categoria || 'Geral'
                }));
                setTodosExames(examesFiltrados);
                console.log('Exames filtrados (productGroup === "Exames"):', examesFiltrados.length, examesFiltrados.slice(0, 3));
            } catch (error) {
                console.error('Erro ao buscar exames:', error);
                toast.error('Erro ao carregar lista de exames');
            }
        };
        fetchExames();
    }, []);

    // Carregar exames ao abrir o modal
    useEffect(() => {
        if (isModalExameOpen && todosExames.length > 0) {
            setExameOptions(todosExames);
        }
    }, [isModalExameOpen, todosExames]);

    const handleSearchExame = (value) => {
        setSearchExame(value);
        // Filtrar exames baseado na pesquisa, ou mostrar todos se não houver pesquisa
        const filtered = value.length >= 2 
            ? todosExames.filter(ex => ex.nome.toLowerCase().includes(value.toLowerCase()))
            : todosExames;
        setExameOptions(filtered);
        setLoadingExames(false);
    };

    const handleAddExame = (exame) => {
        const novo = {
            id: Date.now() + Math.random(),
            designacao: exame.nome,
            obs: '',
            urgencia: false,
            categoria: exame.categoria,
            produtoId: exame.id
        };
        setListaExamesRequisitado(prev => [...prev, novo]);
        setIsModalExameOpen(false);
        setSearchExame('');
        setExameOptions([]);
        messageApi.success(`${exame.nome} adicionado`);
    };

    const removerExame = (record) => {
        setListaExamesRequisitado(prev => prev.filter(i => i.id !== record.id));
    };

    const updateObs = (record, value) => {
        setListaExamesRequisitado(prev =>
            prev.map(i => i.id === record.id ? { ...i, obs: value } : i)
        );
    };

    const toggleUrgencia = (record) => {
        setListaExamesRequisitado(prev =>
            prev.map(i => i.id === record.id ? { ...i, urgencia: !i.urgencia } : i)
        );
    };

    const colunasExames = [
        {
            title: 'Exame',
            key: 'exame',
            render: (_, record) => (
                <div>
                    <strong>{record.designacao}</strong>
                    <br />
                    <Tag color="blue" style={{ marginTop: 4, fontSize: 11 }}>{record.categoria}</Tag>
                </div>
            ),
        },
        {
            title: 'Observações',
            key: 'obs',
            render: (_, record) => (
                <Input
                    placeholder="Ex: jejum de 8h"
                    value={record.obs}
                    onChange={(e) => updateObs(record, e.target.value)}
                    className="exames-input-obs"
                />
            ),
        },
        {
            title: 'Prioridade',
            key: 'urgencia',
            render: (_, record) => (
                <Tag
                    color={record.urgencia ? 'red' : 'green'}
                    className="exame-prioridade"
                    onClick={() => toggleUrgencia(record)}
                    style={{ cursor: 'pointer' }}
                >
                    {record.urgencia ? 'URGENTE' : 'ROTINA'}
                </Tag>
            ),
        },
        {
            title: 'Ação',
            key: 'acao',
            render: (_, record) => (
                <Button danger size="small" className="exames-btn-remover" onClick={() => removerExame(record)}>
                    Remover
                </Button>
            ),
        },
    ];

    // === FUNÇÕES PRINCIPAIS ===
    useEffect(() => { _carrgarDados(); }, []);

    useEffect(() => {
        if (isModalConsulta) {
            formConsulta.setFieldsValue({ motivoConsulta, historiaClinica, exameFisico, receita });
        }
    }, [motivoConsulta, historiaClinica, exameFisico, receita, isModalConsulta, formConsulta]);

    const _showModalConsulta = async (idInscricao, nome) => {
        console.log('Abrindo modal de consulta para inscrição ID:', idInscricao, 'nome:', nome);
        limpar(); setNomePaciente(nome);
        try {
            console.log('Buscando consulta existente...');
            const response = await api.get(`/consulta/${idInscricao}/ABERTO`);
            console.log('Consulta encontrada:', response.data);
            setIsConsultaCriada(true); 
            updateFieldsInForm(response.data);
            setdataCIDInicial(tryParse(response.data.diagnosticoInicial));
            setdataCIDFinal(tryParse(response.data.diagnosticoFinal));
        } catch (error) {
            console.log('Consulta não encontrada (erro esperado), criando nova...');
            console.log('Erro detalhado:', error.response?.status, error.response?.data);
            limpar();
        }
        setIdInscricao(idInscricao); 
        setIsModalConsulta(true);
        console.log('Modal de consulta aberto - isModalConsulta:', true);
    };

    const tryParse = (json) => typeof json === 'string' ? (JSON.parse(json) || []) : (json || []);

    const handleCancel = () => setIsModalConsulta(false);

    const success = (msg) => messageApi.success(msg);
    const error = (msg) => messageApi.error(msg);

    const limpar = () => {
        setIsConsultaCriada(false); setMotivoConsulta(''); setHistoriaClinica(''); setExameFisico('');
        setReceita(''); setId(0); setListaExamesRequisitado([]); setdataCIDInicial([]); setdataCIDFinal([]);
        formConsulta.resetFields();
    };

    const _carrgarDados = async () => {
        try {
            console.log('Carregando dados para consulta...');
            const response = await api.get('inscricao/all/consulta');
            console.log('Resposta da API:', response.data);
            const dadosFiltrados = (response.data || []).filter(i => i).map(i => ({ ...i, tempo: i.dataCriacao }));
            console.log('Dados filtrados:', dadosFiltrados);
            setData(dadosFiltrados);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    };

    const prepararConsulta = (values) => {
        const empresaId = getEmpresaId();
        console.log('Preparando consulta com empresaId:', empresaId);
        
        return {
            ...values, 
            dataConsulta: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            estadoConsulta: 'ABERTO', 
            inscricaoId: idInscricao,
            diagnosticoInicial: JSON.stringify(dataCIDInicial), 
            diagnosticoFinal: JSON.stringify(dataCIDFinal),
            usuarioId: 1,
            empresaId
        };
    };

    const _onFinishCriar = async (values) => {
        setLoading(true);
        await api.post('consulta/add', prepararConsulta(values))
            .then(r => { setId(r.data.id); success('Consulta iniciada'); setIsConsultaCriada(true); })
            .catch(() => error('Erro ao iniciar'))
            .finally(() => setLoading(false));
    };

    const _onFinishActualizar = async (values) => {
        setLoading(true);
        await api.put('consulta/edit', { ...prepararConsulta(values), id })
            .then(() => success('Atualizado'))
            .catch(() => error('Erro ao salvar'))
            .finally(() => setLoading(false));
    };

    const _onFinalizarInscricao = async () => {
        await api.put(`inscricao/estadocondicao/edit/${idInscricao}/FECHADO`)
            .then(() => _carrgarDados()).catch(() => {});
    };

    const updateFieldsInForm = (d) => {
        setMotivoConsulta(d.motivoConsulta); setHistoriaClinica(d.historiaClinica);
        setExameFisico(d.exameFisico); setReceita(d.receita); setId(d.id);
    };

    // === CORRIGIDO: ERRO 400 ===
    const salvarRequisicao = async () => {
        try {
            const empresaId = getEmpresaId();
            console.log('Salvando requisição com empresaId:', empresaId);
            
            const req = {
                dataRequisicao: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                status: true,
                usuarioId: 1,
                inscricaoId: idInscricao,
                empresaId: empresaId,
                finalizado: false
            };

            const res = await api.post('requisicaoexame/add', req);
            const requisicaoId = res.data.id;

            // Salvar linhas
            for (const item of listaExamesRequisitado) {
                console.log('Item original:', item);
                const linhaData = {
                    // Não enviar ID - backend vai gerar automaticamente
                    estado: 'nao_efetuado',
                    exame: item.designacao,
                    produtoId: item.produtoId || null, // Garantir que exista
                    requisicaoExameId: requisicaoId,
                    status: false,
                    finalizado: false,
                    empresaId,
                    hora: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss") // Formato LocalDateTime
                };
                console.log('Enviando linha da requisição (sem ID):', linhaData);
                try {
                    await api.post('linharequisicaoexame/add', linhaData);
                } catch (err) {
                    console.error('Erro detalhado do backend:', err.response?.data);
                    throw err;
                }
            }

            setListaExamesRequisitado([]);
            viewPdfGenerico('requisicao_exame', requisicaoId);
            success('Requisição gerada com sucesso');
        } catch (err) {
            console.error('Erro ao salvar requisição:', err);
            error('Erro ao gerar requisição');
        }
    };

    const _itemsTabs = [
        { key: '1', label: 'Motivo da Consulta', children: <Form.Item name="motivoConsulta" rules={[{ required: true }]}><TextToSpeech inputText={motivoConsulta} setInputText={setMotivoConsulta} /></Form.Item> },
        { key: '2', label: 'História Clínica', children: <Form.Item name="historiaClinica"><TextToSpeech inputText={historiaClinica} setInputText={setHistoriaClinica} /></Form.Item> },
        { key: '3', label: 'Exame Físico', children: <Form.Item name="exameFisico"><TextToSpeech inputText={exameFisico} setInputText={setExameFisico} /></Form.Item> },
        { key: '4', label: 'Diagnóstico Inicial', children: <Form.Item name="diagnosticoInicial"><Cid10 data={dataCIDInicial} setData={setdataCIDInicial} /></Form.Item> },
        {
            key: '5',
            label: 'Exames Complementares',
            children: (
                <div className="exames-container">
                    <div className="exames-header">
                        <h4>Exames Requisitados</h4>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            className="exames-btn-adicionar"
                            onClick={() => setIsModalExameOpen(true)}
                        >
                            Adicionar Exame
                        </Button>
                    </div>

                    <Table
                        dataSource={listaExamesRequisitado}
                        columns={colunasExames}
                        rowKey="id"
                        pagination={false}
                        locale={{ emptyText: 'Nenhum exame adicionado' }}
                        className="exames-table"
                    />

                    {listaExamesRequisitado.length > 0 && (
                        <Button block size="large" className="exames-btn-salvar" onClick={salvarRequisicao}>
                            Gerar Requisição
                        </Button>
                    )}

                    {/* MODAL ADICIONAR EXAME */}
                    <Modal
                        open={isModalExameOpen}
                        onCancel={() => {
                            setIsModalExameOpen(false);
                            setSearchExame('');
                            setExameOptions([]);
                            setLoadingExames(false);
                        }}
                        footer={null}
                        width={800}
                        title="Adicionar Exame Complementar"
                    >
                        <div className="exames-search-container">
                            <Input
                                prefix={<SearchOutlined />}
                                placeholder="Digite o nome do exame..."
                                value={searchExame}
                                onChange={(e) => handleSearchExame(e.target.value)}
                                size="large"
                                addonAfter={loadingExames ? <LoadingOutlined spin /> : null}
                            />
                        </div>

                        <div style={{ marginTop: 20, maxHeight: 300, overflowY: 'auto' }}>
                            {loadingExames ? (
                                <div style={{ textAlign: 'center', padding: 20 }}>
                                    <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
                                    <p>Carregando exames...</p>
                                </div>
                            ) : exameOptions.length > 0 ? (
                                <>
                                    <div style={{ marginBottom: 10, color: '#666' }}>
                                        {searchExame.length >= 2 
                                            ? `${exameOptions.length} exames encontrados para "${searchExame}"`
                                            : `Mostrando todos ${exameOptions.length} exames disponíveis`
                                        }
                                    </div>
                                    {exameOptions.map((exame) => (
                                        <div
                                            key={exame.id}
                                            style={{
                                                padding: 12,
                                                border: '1px solid #d9d9d9',
                                                borderRadius: 8,
                                                marginBottom: 8,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                            onClick={() => handleAddExame(exame)}
                                        >
                                            <div>
                                                <strong>{exame.nome}</strong>
                                                <br />
                                                <Tag color="blue" style={{ marginTop: 4, fontSize: 11 }}>{exame.categoria}</Tag>
                                            </div>
                                            <Button
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddExame(exame);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <Empty description={searchExame.length >= 2 ? "Nenhum exame encontrado para esta pesquisa" : "Nenhum exame disponível"} />
                            )}
                        </div>
                    </Modal>
                </div>
            ),
        },
        { key: '6', label: 'Diagnóstico Final', children: <Form.Item name="diagnosticoFinal"><Cid10 data={dataCIDFinal} setData={setdataCIDFinal} /></Form.Item> },
        { key: '7', label: 'Receituário', children: <Receituario idInscricao={idInscricao} /> },
        { key: '10', label: 'Procedimentos', children: <ConfigProvider locale={ptPT}><Procedimento idInscricao={idInscricao} /></ConfigProvider> },
        { key: '11', label: 'Internamento', children: <Internamento /> },
        { key: '12', label: 'Banco de Urgência', children: <BancoUrgencia /> },
    ];

    return (
        <>
            {contextHolder}
            {console.log('Renderizando Consulta - isModalConsulta:', isModalConsulta)}

            {/* Fila de Consulta */}
            <div className="consulta-container">
                <Card className="stock-card consulta-fila-card" title="Fila de Consultas" extra={<Tag color="processing">Atualizado agora</Tag>}>
                    <List
                        dataSource={data}
                        renderItem={(item) => (
                            <List.Item className="consulta-paciente-item">
                                <div className="consulta-paciente-info">
                                    <Avatar icon={<UserOutlined />} className="consulta-avatar" />
                                    <div>
                                        <Title level={5} className="consulta-nome">{item.nome}</Title>
                                        <Text type="secondary">
                                            <ClockCircleOutlined /> {format(new Date(item.tempo), 'HH:mm')} • ID: {item.inscricaoId}
                                        </Text>
                                    </div>
                                </div>
                                <Space>
                                    <Tooltip title="Iniciar Consulta">
                                        <Button type="primary" icon={<FileSearchOutlined />} onClick={() => _showModalConsulta(item.inscricaoId, item.nome)} className="stock-btn stock-btn-primary consulta-btn-acao" />
                                    </Tooltip>
                                    <Tooltip title="Triagem">
                                        <Button icon={<MedicineBoxOutlined />} onClick={() => { setInscricaoIdTriagem(item.inscricaoId); setIsModalTriagem(true); }} className="stock-btn consulta-btn-triagem" />
                                    </Tooltip>
                                    <Tooltip title="Finalizar">
                                        <Button danger icon={<CloseCircleOutlined />} onClick={() => { setIdInscricao(item.inscricaoId); setIsModalFinalizarAtendimento(true); }} className="stock-btn">Finalizar</Button>
                                    </Tooltip>
                                </Space>
                            </List.Item>
                        )}
                    />
                </Card>
            </div>

            {/* Modal de Consulta */}
            <Modal
                title={<Title level={4} className="stock-header-title">Consulta • {nomePaciente}</Title>}
                open={isModalConsulta}
                onCancel={handleCancel}
                footer={null}
                width={1100}
                className="stock-modal consulta-modal"
            >
                <Form form={formConsulta} onFinish={isConsultaCriada ? _onFinishActualizar : _onFinishCriar} layout="vertical">
                    <Row justify="end" className="mb-4">
                        <Button type="primary" htmlType="submit" loading={loading} size="large" className="stock-btn stock-btn-primary btn-salvar-consulta">
                            {isConsultaCriada ? 'Salvar Alterações' : 'Iniciar Consulta'}
                        </Button>
                    </Row>

                    <Tabs items={_itemsTabs} className="stock-tabs consulta-tabs" />
                </Form>
            </Modal>

            <ModalTriagem 
                estado={isModalTriagem} 
                inscricaoId={inscricaoIdTriagem} 
                usuarioId={1} 
                onCancel={() => { setIsModalTriagem(false); setInscricaoIdTriagem(null); }} 
                exibirEncaminhamento={true} 
                exibirManchester={false} 
                carrgarDados={_carrgarDados}
            />
            <ModalFinalizarAtendimento estado={isModalFinalizarAtendimento} onCancel={() => setIsModalFinalizarAtendimento(false)} onFinalizar={_onFinalizarInscricao} />
        </>
    );
}

export default Consulta;
