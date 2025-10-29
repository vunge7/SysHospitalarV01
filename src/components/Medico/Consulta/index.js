import React, { useEffect, useState } from 'react';
import { api } from '../../../service/api';
import Receituario from '../Receituario';
import Procedimento from '../../Procedimento';
import ExameRequisitado from '../../ExameRequisitado';
import Cid10 from '../../Cid10';
import BancoUrgencia from '../BancoUrgencia';
import Internamento from '../Internamento';
import { ConfigProvider } from 'antd';
import ptPT from 'antd/lib/locale/pt_PT';
import TextToSpeech from '../../TextToSpeech';
import { viewPdfGenerico, ModalTriagem, ModalFinalizarAtendimento } from '../../util/utilitarios';
import {
    List, Button, Modal, Tabs, Form, message, Tooltip,
    Card, Row, Tag, Space, Avatar, Typography, Divider
} from 'antd';
import {
    MedicineBoxOutlined, CloseCircleOutlined, FileSearchOutlined,
    PrinterOutlined, ClockCircleOutlined, UserOutlined
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

    const removerItemExameRequisitado = (row) => {
        setListaExamesRequisitado(prev => prev.filter(i => i.id !== row.id));
    };

    const updateDescricao = (row, obs) => {
        setListaExamesRequisitado(prev => prev.map(i => i.id === row.id ? { ...i, obs } : i));
    };

    const salvarRequisicao = async () => {
        const req = { dataRequisicao: format(new Date(), 'yyyy-MM-dd HH:mm:ss'), status: true, usuarioId: 1, inscricaoId: idInscricao, finalizado: false };
        await api.post('requisicaoexame/add', req)
            .then(r => {
                listaExamesRequisitado.forEach(i => salvarLinhaExamaRequisica(i, r.data.id));
                setListaExamesRequisitado([]);
                viewPdfGenerico('requisicao_exame', r.data.id);
            });
    };

    const salvarLinhaExamaRequisica = async (item, reqId) => {
        await api.post('linharequisicaoexame/add', {
            estado: 'nao_efetuado', exame: item.designacao, produtoId: item.id,
            requisicaoExameId: reqId, status: false, finalizado: false
        });
    };

    const visualizar = (area) => viewPdfGenerico(area, idInscricao);

    const _itemsTabs = [
        { key: '1', label: 'Motivo da Consulta', children: <Form.Item name="motivoConsulta" rules={[{ required: true }]}><TextToSpeech inputText={motivoConsulta} setInputText={setMotivoConsulta} /></Form.Item> },
        { key: '2', label: 'História Clínica', children: <Form.Item name="historiaClinica"><TextToSpeech inputText={historiaClinica} setInputText={setHistoriaClinica} /></Form.Item> },
        { key: '3', label: 'Exame Físico', children: <Form.Item name="exameFisico"><TextToSpeech inputText={exameFisico} setInputText={setExameFisico} /></Form.Item> },
        { key: '4', label: 'Diagnóstico Inicial', children: <Form.Item name="diagnosticoInicial"><Cid10 data={dataCIDInicial} setData={setdataCIDInicial} /></Form.Item> },
        { key: '5', label: 'Exames Complementares', children: <ExameRequisitado listaExamesRequisitado={listaExamesRequisitado} setListaExamesRequisitado={setListaExamesRequisitado} removerItemExameRequisitado={removerItemExameRequisitado} updateDescricao={updateDescricao} salvarRequisicao={salvarRequisicao} /> },
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