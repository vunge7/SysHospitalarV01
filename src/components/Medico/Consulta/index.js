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
import {
    List, Button, Modal, Tabs, Form, message, Tooltip,
    Card, Row, Tag, Space, Avatar, Typography,
    Table, Input, Spin, Empty
} from 'antd';
import {
    MedicineBoxOutlined, CloseCircleOutlined, FileSearchOutlined,
    ClockCircleOutlined, UserOutlined, PlusOutlined, SearchOutlined, LoadingOutlined
} from '@ant-design/icons';
import { format } from 'date-fns';
import './Consulta.css';

const { Title, Text } = Typography;

function Consulta() {
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

    // === MODAL ADICIONAR EXAME ===
    const [isModalExameOpen, setIsModalExameOpen] = useState(false);
    const [searchExame, setSearchExame] = useState('');
    const [exameOptions, setExameOptions] = useState([]);
    const [loadingExames, setLoadingExames] = useState(false);

    // Mock de exames (substitua por API real)
    const mockExames = [
        { id: 1, nome: 'Hemograma Completo', categoria: 'Hematologia' },
        { id: 2, nome: 'Glicemia em Jejum', categoria: 'Bioquímica' },
        { id: 3, nome: 'Raio-X Tórax', categoria: 'Imagem' },
        { id: 4, nome: 'Eletrocardiograma', categoria: 'Cardiologia' },
        { id: 5, nome: 'Urina Tipo I', categoria: 'Urinálise' },
        { id: 6, nome: 'Colesterol Total', categoria: 'Bioquímica' },
        { id: 7, nome: 'Tomografia de Crânio', categoria: 'Imagem' },
        { id: 8, nome: 'Ecocardiograma', categoria: 'Cardiologia' },
    ];

    const handleSearchExame = (value) => {
        setSearchExame(value);
        if (value.length >= 2) {
            setLoadingExames(true);
            setTimeout(() => {
                const filtered = mockExames
                    .filter(ex => ex.nome.toLowerCase().includes(value.toLowerCase()))
                    .map(ex => ({ id: ex.id, nome: ex.nome, categoria: ex.categoria }));
                setExameOptions(filtered);
                setLoadingExames(false);
            }, 400); // Simula delay de API
        } else {
            setExameOptions([]);
            setLoadingExames(false);
        }
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
        formConsulta.setFieldsValue({ motivoConsulta, historiaClinica, exameFisico, receita });
    }, [motivoConsulta, historiaClinica, exameFisico, receita]);

    const _showModalConsulta = async (idInscricao, nome) => {
        limpar(); setNomePaciente(nome);
        await api.get(`/consulta/${idInscricao}/ABERTO`)
            .then(r => {
                setIsConsultaCriada(true); updateFieldsInForm(r.data);
                setdataCIDInicial(tryParse(r.data.diagnosticoInicial));
                setdataCIDFinal(tryParse(r.data.diagnosticoFinal));
            })
            .catch(() => limpar());
        setIdInscricao(idInscricao); setIsModalConsulta(true);
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
        await api.get('inscricao/all/consulta')
            .then(r => setData((r.data || []).filter(i => i).map(i => ({ ...i, tempo: i.dataCriacao }))))
            .catch(() => {});
    };

    const prepararConsulta = (values) => ({
        ...values, dataConsulta: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        estadoConsulta: 'ABERTO', inscricaoId: idInscricao,
        diagnosticoInicial: JSON.stringify(dataCIDInicial), diagnosticoFinal: JSON.stringify(dataCIDFinal),
        usuarioId: 1
    });

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
            const req = {
                dataRequisicao: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                status: true,
                usuarioId: 1,
                inscricaoId: idInscricao,
                finalizado: false
            };

            const res = await api.post('requisicaoexame/add', req);
            const requisicaoId = res.data.id;

            // Salvar linhas
            for (const item of listaExamesRequisitado) {
                await api.post('linharequisicaoexame/add', {
                    estado: 'nao_efetuado',
                    exame: item.designacao,
                    produtoId: item.produtoId || null, // Garantir que exista
                    requisicaoExameId: requisicaoId,
                    status: false,
                    finalizado: false
                });
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
                        title={
                            <div className="exames-modal-title">
                                <MedicineBoxOutlined />
                                Adicionar Exame Complementar
                            </div>
                        }
                        open={isModalExameOpen}
                        onCancel={() => {
                            setIsModalExameOpen(false);
                            setSearchExame('');
                            setExameOptions([]);
                            setLoadingExames(false);
                        }}
                        footer={null}
                        width={720}
                        className="exames-modal"
                    >
                        <div className="exames-search-container">
                            <Input
                                prefix={<SearchOutlined className="exames-search-icon" />}
                                placeholder="Digite o nome do exame..."
                                value={searchExame}
                                onChange={(e) => handleSearchExame(e.target.value)}
                                size="large"
                                className="exames-search-input"
                                addonAfter={loadingExames ? <LoadingOutlined spin /> : null}
                            />
                        </div>

                        <div className="exames-lista">
                            {loadingExames ? (
                                <div className="exames-loading">
                                    <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
                                    <p>Buscando exames...</p>
                                </div>
                            ) : exameOptions.length > 0 ? (
                                exameOptions.map((exame) => {
                                    const categoriaClass = exame.categoria.toLowerCase().replace(/[^a-z]/g, '');
                                    return (
                                        <div
                                            key={exame.id}
                                            className="exame-card"
                                            onClick={() => handleAddExame(exame)}
                                        >
                                            <div className="exame-info">
                                                <div className={`exame-icon ${categoriaClass}`}>
                                                    {exame.categoria[0]}
                                                </div>
                                                <div className="exame-detalhes">
                                                    <h5>{exame.nome}</h5>
                                                    <p>Exame de {exame.categoria}</p>
                                                </div>
                                            </div>
                                            <div className="exame-tags">
                                                <span className={`exame-categoria ${categoriaClass}`}>
                                                    {exame.categoria}
                                                </span>
                                                <Button
                                                    className="exame-add-btn"
                                                    icon={<PlusOutlined />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddExame(exame);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : searchExame.length >= 2 ? (
                                <div className="exames-empty">
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum exame encontrado" />
                                </div>
                            ) : (
                                <div className="exames-empty">
                                    <SearchOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                                    <p>Digite pelo menos 2 caracteres para buscar</p>
                                </div>
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

            <ModalTriagem estado={isModalTriagem} inscricaoId={inscricaoIdTriagem} usuarioId={1} onCancel={() => { setIsModalTriagem(false); setInscricaoIdTriagem(null); }} exibirEncaminhamento={false} exibirManchester={false} />
            <ModalFinalizarAtendimento estado={isModalFinalizarAtendimento} onCancel={() => setIsModalFinalizarAtendimento(false)} onFinalizar={_onFinalizarInscricao} />
        </>
    );
}

export default Consulta;