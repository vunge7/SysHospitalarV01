import React, { useState, useEffect, useRef } from 'react';
import '../PacienteTabs/style.css';
import {
    profissaoFONTE,
    habiliatacaLiterariaFONTE,
    estadoCivilFONTE,
} from '../../../components/util/utilitarios';
import { api } from '../../../service/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import {
    Card, Row, Col, Select, Input, Button, Tag, Divider, Popconfirm, Space
} from 'antd';
import {
    HomeOutlined, FileTextOutlined, HeartOutlined, InsuranceOutlined, BankOutlined,
    PlusOutlined, CheckOutlined, CloseOutlined, LoadingOutlined,
    EditOutlined, DeleteOutlined
} from '@ant-design/icons';

const { Option } = Select;

const PacienteTabs = (props) => {
    const { setConveniosParaSalvar } = props;
    const [activeTab, setActiveTab] = useState('endereco');
    const tabsRef = useRef({});
    const indicatorRef = useRef(null);

    const [seguradoras, setSeguradoras] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [empresaSelecionada, setEmpresaSelecionada] = useState(props.empresaId || '');

    const [convenio, setConvenio] = useState({
        seguradorasSelecionadas: [],
        numeroCartao: '',
        validade: '',
    });

    const [conveniosPaciente, setConveniosPaciente] = useState([]);
    const [loadingConvenios, setLoadingConvenios] = useState(false);

    const [mostrarFormNovaSeguradora, setMostrarFormNovaSeguradora] = useState(false);
    const [editandoSeguradora, setEditandoSeguradora] = useState(null);
    const [loadingSeguradora, setLoadingSeguradora] = useState(false);
    const [novaSeguradora, setNovaSeguradora] = useState({
        nome: '', nif: '', telefone: '', email: '', endereco: '', empresaId: null, status: true
    });

    const [mostrarFormNovaEmpresa, setMostrarFormNovaEmpresa] = useState(false);
    const [editandoEmpresa, setEditandoEmpresa] = useState(null);
    const [loadingEmpresa, setLoadingEmpresa] = useState(false);
    const [novaEmpresa, setNovaEmpresa] = useState({
        nome: '', tipo: 'MATRIZ', nif: '', telefone: '', endereco: '',
        email: '', status: true, empresaMatrizId: null, seguradoraId: null
    });

    const tabConfig = [
        { key: 'endereco', label: 'Endereço', icon: <HomeOutlined /> },
        { key: 'fiscal', label: 'Fiscal', icon: <FileTextOutlined /> },
        { key: 'nascimento', label: 'Nascimento', icon: <HeartOutlined /> },
        { key: 'seguradora', label: 'Convênio', icon: <InsuranceOutlined />, badge: conveniosPaciente.length },
        { key: 'empresa', label: 'Empresa', icon: <BankOutlined /> },
    ];

    useEffect(() => {
        const updateIndicator = () => {
            const currentTab = tabsRef.current[activeTab];
            if (currentTab && indicatorRef.current) {
                indicatorRef.current.style.width = `${currentTab.offsetWidth}px`;
                indicatorRef.current.style.left = `${currentTab.offsetLeft}px`;
            }
        };
        updateIndicator();
        window.addEventListener('resize', updateIndicator);
        return () => window.removeEventListener('resize', updateIndicator);
    }, [activeTab, conveniosPaciente.length]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resSeg, resEmp] = await Promise.all([
                    api.get('/seguradora/all'),
                    api.get('/empresa/all')
                ]);
                setSeguradoras(resSeg.data || []);
                setEmpresas(resEmp.data || []);
            } catch (error) {
                toast.error('Falha ao carregar dados.');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchConvenios = async () => {
            if (!props.pacienteId) return;
            setLoadingConvenios(true);
            try {
                const res = await api.get(`/pacienteSeguradora/all/${props.pacienteId}`);
                setConveniosPaciente(res.data || []);
            } catch (err) {
                setConveniosPaciente([]);
            } finally {
                setLoadingConvenios(false);
            }
        };
        fetchConvenios();
    }, [props.pacienteId]);

    const handleNovaSeguradoraChange = (e) => {
        const { name, value } = e.target;
        setNovaSeguradora(prev => ({ ...prev, [name]: value }));
    };

    const handleNovaEmpresaChange = (e) => {
        const { name, value } = e.target;
        setNovaEmpresa(prev => ({ ...prev, [name]: value }));
    };

    const handleCadastrarSeguradora = async (e) => {
        e?.preventDefault();
        if (!novaSeguradora.nome.trim()) return toast.warn('Nome é obrigatório!');

        setLoadingSeguradora(true);
        try {
            const payload = {
                nome: novaSeguradora.nome.trim(),
                nif: novaSeguradora.nif.trim() || null,
                telefone: novaSeguradora.telefone.trim() || null,
                email: novaSeguradora.email.trim() || null,
                endereco: novaSeguradora.endereco.trim() || null,
                empresaId: novaSeguradora.empresaId || null,
                status: true
            };

            let res;
            if (editandoSeguradora) {
                res = await api.put(`/seguradora/${editandoSeguradora.id}`, payload);
                toast.success(`Seguradora "${res.data.nome}" atualizada!`);
            } else {
                res = await api.post('/seguradora/add', payload);
                toast.success(`Seguradora "${res.data.nome}" cadastrada!`);
            }

            const nova = res.data;
            setSeguradoras(prev => editandoSeguradora
                ? prev.map(s => s.id === editandoSeguradora.id ? nova : s)
                : [...prev, nova]
            );

            if (!editandoSeguradora) {
                setConvenio(prev => ({
                    ...prev,
                    seguradorasSelecionadas: [...prev.seguradorasSelecionadas, nova.id]
                }));
                if (setConveniosParaSalvar) {
                    setConveniosParaSalvar(prev => [...prev, {
                        seguradoraId: nova.id,
                        numeroCartao: convenio.numeroCartao,
                        validade: convenio.validade,
                        empresaId: novaSeguradora.empresaId
                    }]);
                }
            }

            setMostrarFormNovaSeguradora(false);
            setEditandoSeguradora(null);
            setNovaSeguradora({ nome: '', nif: '', telefone: '', email: '', endereco: '', empresaId: null, status: true });
        } catch (error) {
            toast.error(error.response?.data || 'Erro ao salvar seguradora.');
        } finally {
            setLoadingSeguradora(false);
        }
    };

    const handleCadastrarEmpresa = async (e) => {
        e?.preventDefault();
        if (!novaEmpresa.nome.trim()) return toast.warn('Nome é obrigatório!');

        setLoadingEmpresa(true);
        try {
            const payload = {
                nome: novaEmpresa.nome.trim(),
                tipo: novaEmpresa.tipo,
                nif: novaEmpresa.nif.trim() || null,
                telefone: novaEmpresa.telefone.trim() || null,
                email: novaEmpresa.email.trim() || null,
                endereco: novaEmpresa.endereco.trim() || null,
                status: true,
                empresaMatrizId: null,
                seguradoraId: null
            };

            let res;
            if (editandoEmpresa) {
                res = await api.put(`/empresa/${editandoEmpresa.id}`, payload);
                toast.success(`Empresa "${res.data.nome}" atualizada!`);
            } else {
                res = await api.post('/empresa/add', payload);
                toast.success(`Empresa "${res.data.nome}" cadastrada!`);
            }

            const nova = res.data;
            setEmpresas(prev => editandoEmpresa
                ? prev.map(e => e.id === editandoEmpresa.id ? nova : e)
                : [...prev, nova]
            );

            if (!editandoEmpresa) {
                setEmpresaSelecionada(nova.id);
                props.handleChange('empresaId', nova.id);
            }

            setMostrarFormNovaEmpresa(false);
            setEditandoEmpresa(null);
            setNovaEmpresa({
                nome: '', tipo: 'MATRIZ', nif: '', telefone: '', endereco: '',
                email: '', status: true, empresaMatrizId: null, seguradoraId: null
            });
        } catch (error) {
            toast.error(error.response?.data || 'Erro ao salvar empresa.');
        } finally {
            setLoadingEmpresa(false);
        }
    };

    const handleExcluirSeguradora = async (id) => {
        try {
            await api.delete(`/seguradora/${id}`);
            setSeguradoras(prev => prev.filter(s => s.id !== id));
            toast.success('Seguradora excluída!');
        } catch (error) {
            toast.error('Erro ao excluir seguradora.');
        }
    };

    const handleExcluirEmpresa = async (id) => {
        try {
            await api.delete(`/empresa/${id}`);
            setEmpresas(prev => prev.filter(e => e.id !== id));
            if (empresaSelecionada === id) {
                setEmpresaSelecionada('');
                props.handleChange('empresaId', null);
            }
            toast.success('Empresa excluída!');
        } catch (error) {
            toast.error(error.response?.data || 'Erro ao excluir empresa. Verifique filiais.');
        }
    };

    const iniciarEdicaoSeguradora = (seg) => {
        setEditandoSeguradora(seg);
        setNovaSeguradora({
            nome: seg.nome, nif: seg.nif || '', telefone: seg.telefone || '',
            email: seg.email || '', endereco: seg.endereco || '', empresaId: seg.empresaId || null
        });
        setMostrarFormNovaSeguradora(true);
    };

    const iniciarEdicaoEmpresa = (emp) => {
        setEditandoEmpresa(emp);
        setNovaEmpresa({
            nome: emp.nome, tipo: emp.tipo, nif: emp.nif || '', telefone: emp.telefone || '',
            email: emp.email || '', endereco: emp.endereco || '', status: emp.status,
            empresaMatrizId: emp.empresaMatrizId, seguradoraId: emp.seguradoraId
        });
        setMostrarFormNovaEmpresa(true);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'endereco':
                return (
                    <div className="tab-content">
                        <Row gutter={16}>
                            <Col xs={24} md={12}><div className="form-group"><label>País:</label><Select value={props.paisEndereco} onChange={v => props.handleChange('paisEndereco', v)} style={{ width: '100%' }}><Option value="">Selecione</Option><Option value="Angola">Angola</Option></Select></div></Col>
                            <Col xs={24} md={12}><div className="form-group"><label>Província:</label><Select value={props.provinciaEndereco} onChange={v => props.handleChange('provinciaEndereco', v)} style={{ width: '100%' }}><Option value="">Selecione</Option><Option value="Luanda">Luanda</Option></Select></div></Col>
                        </Row>
                        <Row gutter={16}>
                            <Col xs={24} md={12}><div className="form-group"><label>Município:</label><Select value={props.municipioEndereco} onChange={v => props.handleChange('municipioEndereco', v)} style={{ width: '100%' }}><Option value="">Selecione</Option><Option value="Belas">Belas</Option></Select></div></Col>
                            <Col xs={24} md={12}><div className="form-group"><label>Endereço:</label><Input value={props.endereco} onChange={e => props.handleChange('endereco', e.target.value)} /></div></Col>
                        </Row>
                    </div>
                );

            case 'fiscal':
                return (
                    <div className="tab-content">
                        <Row gutter={16}>
                            <Col xs={24} md={12}><div className="form-group"><label>Profissão:</label><Select value={props.profissao} onChange={v => props.handleChange('profissao', v)} style={{ width: '100%' }}><Option value="">--Selecione--</Option>{profissaoFONTE.map(i => <Option key={i.id} value={i.value}>{i.value}</Option>)}</Select></div></Col>
                            <Col xs={24} md={12}><div className="form-group"><label>Habilitação Literária:</label><Select value={props.habilitacao} onChange={v => props.handleChange('habilitacao', v)} style={{ width: '100%' }}><Option value="">--Selecione--</Option>{habiliatacaLiterariaFONTE.map(i => <Option key={i.id} value={i.value}>{i.value}</Option>)}</Select></div></Col>
                        </Row>
                        <div className="form-group"><label>Estado Civil:</label><Select value={props.estadoCivil} onChange={v => props.handleChange('estadoCivil', v)} style={{ width: '100%' }}><Option value="">--Selecione--</Option>{estadoCivilFONTE.map(i => <Option key={i.id} value={i.value}>{i.value}</Option>)}</Select></div>
                    </div>
                );

            case 'nascimento':
                return (
                    <div className="tab-content">
                        <Row gutter={16}>
                            <Col xs={24} md={8}><div className="form-group"><label>Pai:</label><Input value={props.pai} onChange={e => props.handleChange('pai', e.target.value)} /></div></Col>
                            <Col xs={24} md={8}><div className="form-group"><label>Mãe:</label><Input value={props.mae} onChange={e => props.handleChange('mae', e.target.value)} /></div></Col>
                            <Col xs={24} md={8}><div className="form-group"><label>Data de Nascimento:</label><Input type="date" value={props.dataNascimento} onChange={e => props.handleChange('dataNascimento', e.target.value)} /></div></Col>
                        </Row>
                        <Row gutter={16}>
                            <Col xs={24} md={8}><div className="form-group"><label>País:</label><Select value={props.paisNascimento} onChange={v => props.handleChange('paisNascimento', v)} style={{ width: '100%' }}><Option value="">--Selecione--</Option><Option value="Angola">Angola</Option></Select></div></Col>
                            <Col xs={24} md={8}><div className="form-group"><label>Província:</label><Select value={props.provinciaNascimento} onChange={v => props.handleChange('provinciaNascimento', v)} style={{ width: '100%' }}><Option value="">--Selecione--</Option><Option value="Luanda">Luanda</Option></Select></div></Col>
                            <Col xs={24} md={8}><div className="form-group"><label>Município:</label><Select value={props.municipioNascimento} onChange={v => props.handleChange('municipioNascimento', v)} style={{ width: '100%' }}><Option value="">--Selecione--</Option><Option value="Belas">Belas</Option></Select></div></Col>
                        </Row>
                        <Row gutter={16}>
                            <Col xs={24} md={12}><div className="form-group"><label>Local de Nascimento:</label><Input value={props.localNascimento} onChange={e => props.handleChange('localNascimento', e.target.value)} /></div></Col>
                            <Col xs={24} md={12}><div className="form-group"><label>Nacionalidade:</label><Input value={props.nacionalidade} onChange={e => props.handleChange('nacionalidade', e.target.value)} /></div></Col>
                        </Row>
                    </div>
                );

            case 'seguradora':
                return (
                    <div className="tab-content">
                        <h4 style={{ marginBottom: 16, fontWeight: 600 }}>Convênio / Seguradora</h4>
                        {loadingConvenios ? <div style={{ textAlign: 'center', padding: '20px' }}><LoadingOutlined style={{ fontSize: 24 }} /></div> : conveniosPaciente.length > 0 ? (
                            <Card size="small" title="Convênios Atuais" style={{ marginBottom: 24 }}>
                                {conveniosPaciente.map(conv => {
                                    const seg = seguradoras.find(s => s.id === conv.seguradoraId);
                                    return (
                                        <div key={conv.id} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                                            <strong>{seg?.nome || 'Seguradora não encontrada'}</strong>
                                            {conv.numeroCartao && <Tag color="blue" style={{ marginLeft: 8 }}>Cartão: {conv.numeroCartao}</Tag>}
                                            {conv.validade && <Tag color="green">Validade: {format(new Date(conv.validade), 'MM/yyyy')}</Tag>}
                                        </div>
                                    );
                                })}
                            </Card>
                        ) : (
                            <p style={{ color: '#999', fontStyle: 'italic', marginBottom: 16 }}>Nenhum convênio cadastrado.</p>
                        )}

                        <div className="form-group">
                            <label>Seguradoras (múltiplas):</label>
                            <Select
                                mode="multiple"
                                showSearch
                                optionFilterProp="children"
                                style={{ width: '100%' }}
                                placeholder="Selecione uma ou mais seguradoras"
                                value={convenio.seguradorasSelecionadas}
                                onChange={(values) => {
                                    const convenios = values.map(id => {
                                        const seg = seguradoras.find(s => s.id === id);
                                        return { seguradoraId: id, numeroCartao: convenio.numeroCartao, validade: convenio.validade, empresaId: seg?.empresaId || null };
                                    });
                                    setConvenio(prev => ({ ...prev, seguradorasSelecionadas: values }));
                                    if (setConveniosParaSalvar) setConveniosParaSalvar(convenios);
                                }}
                                dropdownRender={menu => (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: '8px 0' }} />
                                        <Button type="text" icon={<PlusOutlined />} onClick={() => { setEditandoSeguradora(null); setNovaSeguradora({ nome: '', nif: '', telefone: '', email: '', endereco: '', empresaId: null, status: true }); setMostrarFormNovaSeguradora(true); }} style={{ width: '100%' }}>
                                            Cadastrar Nova Seguradora
                                        </Button>
                                    </>
                                )}
                            >
                                {seguradoras.map(s => (
                                    <Option key={s.id} value={s.id}>
                                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                            <span>{s.nome}</span>
                                            <Space size={4}>
                                                <EditOutlined style={{ color: '#1890ff', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); iniciarEdicaoSeguradora(s); }} />
                                                <Popconfirm title="Excluir seguradora?" onConfirm={e => { e.stopPropagation(); handleExcluirSeguradora(s.id); }} okText="Sim" cancelText="Não">
                                                    <DeleteOutlined style={{ color: '#ff4d4f', cursor: 'pointer' }} onClick={e => e.stopPropagation()} />
                                                </Popconfirm>
                                            </Space>
                                        </Space>
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        {convenio.seguradorasSelecionadas?.length > 0 && (
                            <>
                                <div className="form-group"><label>Número do Cartão (opcional):</label><Input value={convenio.numeroCartao} onChange={e => setConvenio(prev => ({ ...prev, numeroCartao: e.target.value }))} placeholder="Ex: 123456789" /></div>
                                <div className="form-group"><label>Validade (opcional):</label><Input type="month" value={convenio.validade} onChange={e => setConvenio(prev => ({ ...prev, validade: e.target.value }))} /></div>
                            </>
                        )}

                        {mostrarFormNovaSeguradora && (
                            <Card size="small" style={{ marginTop: 16 }}>
                                <h5>{editandoSeguradora ? 'Editar' : 'Cadastrar'} Seguradora</h5>
                                <Row gutter={16}>
                                    <Col xs={24} md={12}><div className="form-group"><label>Nome *</label><Input name="nome" value={novaSeguradora.nome} onChange={handleNovaSeguradoraChange} placeholder="Ex: Medis" /></div></Col>
                                    <Col xs={24} md={12}><div className="form-group"><label>Empresa (opcional)</label><Select showSearch allowClear placeholder="Selecione" value={novaSeguradora.empresaId} onChange={v => setNovaSeguradora(prev => ({ ...prev, empresaId: v }))} style={{ width: '100%' }}>{empresas.map(e => <Option key={e.id} value={e.id}>{e.nome}</Option>)}</Select></div></Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col xs={24} md={12}><div className="form-group"><label>NIF</label><Input name="nif" value={novaSeguradora.nif} onChange={handleNovaSeguradoraChange} placeholder="Ex: 540000001" /></div></Col>
                                    <Col xs={24} md={12}><div className="form-group"><label>Telefone</label><Input name="telefone" value={novaSeguradora.telefone} onChange={handleNovaSeguradoraChange} placeholder="Ex: 923000001" /></div></Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col xs={24} md={12}><div className="form-group"><label>Email</label><Input name="email" value={novaSeguradora.email} onChange={handleNovaSeguradoraChange} type="email" placeholder="contato@medis.com" /></div></Col>
                                    <Col xs={24} md={12}><div className="form-group"><label>Endereço</label><Input name="endereco" value={novaSeguradora.endereco} onChange={handleNovaSeguradoraChange} placeholder="Rua, nº, bairro" /></div></Col>
                                </Row>
                                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                                    <Button type="primary" onClick={handleCadastrarSeguradora} loading={loadingSeguradora} icon={<CheckOutlined />}>{editandoSeguradora ? 'Atualizar' : 'Cadastrar'}</Button>
                                    <Button danger icon={<CloseOutlined />} onClick={() => { setMostrarFormNovaSeguradora(false); setEditandoSeguradora(null); setNovaSeguradora({ nome: '', nif: '', telefone: '', email: '', endereco: '', empresaId: null, status: true }); }}>Cancelar</Button>
                                </div>
                            </Card>
                        )}
                    </div>
                );

            case 'empresa':
                return (
                    <div className="tab-content">
                        <h4 style={{ marginBottom: 16, fontWeight: 600 }}>Empresa</h4>
                        <div className="form-group">
                            <label>Empresa:</label>
                            <Select
                                showSearch
                                optionFilterProp="children"
                                style={{ width: '100%' }}
                                value={empresaSelecionada}
                                onChange={(value) => { setEmpresaSelecionada(value); props.handleChange('empresaId', value); }}
                                placeholder="Selecione uma empresa..."
                                dropdownRender={menu => (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: '8px 0' }} />
                                        <Button type="text" icon={<PlusOutlined />} onClick={() => { setEditandoEmpresa(null); setNovaEmpresa({ nome: '', tipo: 'MATRIZ', nif: '', telefone: '', endereco: '', email: '', status: true, empresaMatrizId: null, seguradoraId: null }); setMostrarFormNovaEmpresa(true); }} style={{ width: '100%' }}>
                                            Cadastrar Nova Empresa
                                        </Button>
                                    </>
                                )}
                            >
                                {empresas.map(emp => (
                                    <Option key={emp.id} value={emp.id}>
                                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                            <span>{emp.nome}</span>
                                            <Space size={4}>
                                                <EditOutlined style={{ color: '#1890ff', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); iniciarEdicaoEmpresa(emp); }} />
                                                <Popconfirm title="Excluir empresa?" onConfirm={e => { e.stopPropagation(); handleExcluirEmpresa(emp.id); }} okText="Sim" cancelText="Não">
                                                    <DeleteOutlined style={{ color: '#ff4d4f', cursor: 'pointer' }} onClick={e => e.stopPropagation()} />
                                                </Popconfirm>
                                            </Space>
                                        </Space>
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        {mostrarFormNovaEmpresa && (
                            <Card size="small" style={{ marginTop: 16 }}>
                                <h5>{editandoEmpresa ? 'Editar' : 'Cadastrar'} Empresa</h5>
                                <Row gutter={16}>
                                    <Col xs={24} md={12}><div className="form-group"><label>Nome *</label><Input name="nome" value={novaEmpresa.nome} onChange={handleNovaEmpresaChange} placeholder="Ex: DVML Saúde" /></div></Col>
                                    <Col xs={24} md={12}><div className="form-group"><label>Tipo *</label><Select value={novaEmpresa.tipo} onChange={v => setNovaEmpresa(prev => ({ ...prev, tipo: v }))} style={{ width: '100%' }}>
                                        <Option value="MATRIZ">Matriz</Option>
                                        <Option value="FILIAL">Filial</Option>
                                        <Option value="FRANQUIA">Franquia</Option>
                                        <Option value="PARCEIRA">Parceira</Option>
                                    </Select></div></Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col xs={24} md={12}><div className="form-group"><label>NIF</label><Input name="nif" value={novaEmpresa.nif} onChange={handleNovaEmpresaChange} placeholder="Ex: 540000000" /></div></Col>
                                    <Col xs={24} md={12}><div className="form-group"><label>Telefone</label><Input name="telefone" value={novaEmpresa.telefone} onChange={handleNovaEmpresaChange} placeholder="Ex: 923000000" /></div></Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col xs={24} md={12}><div className="form-group"><label>Email</label><Input name="email" value={novaEmpresa.email} onChange={handleNovaEmpresaChange} type="email" placeholder="exemplo@empresa.com" /></div></Col>
                                    <Col xs={24} md={12}><div className="form-group"><label>Endereço</label><Input name="endereco" value={novaEmpresa.endereco} onChange={handleNovaEmpresaChange} placeholder="Rua, nº, bairro" /></div></Col>
                                </Row>
                                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                                    <Button type="primary" onClick={handleCadastrarEmpresa} loading={loadingEmpresa} icon={<CheckOutlined />}>{editandoEmpresa ? 'Atualizar' : 'Cadastrar'}</Button>
                                    <Button danger icon={<CloseOutlined />} onClick={() => { setMostrarFormNovaEmpresa(false); setEditandoEmpresa(null); setNovaEmpresa({ nome: '', tipo: 'MATRIZ', nif: '', telefone: '', endereco: '', email: '', status: true, empresaMatrizId: null, seguradoraId: null }); }}>Cancelar</Button>
                                </div>
                            </Card>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="patient-tabs">
            <div className="tabs-container">
                <div className="tabs">
                    {tabConfig.map(tab => (
                        <div
                            key={tab.key}
                            ref={el => (tabsRef.current[tab.key] = el)}
                            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            <span className="tab-label">{tab.label}</span>
                            {tab.badge !== undefined && tab.badge > 0 && <span className="tab-badge">{tab.badge}</span>}
                        </div>
                    ))}
                </div>
                <div className="tab-indicator" ref={indicatorRef}></div>
            </div>
            <div className="tab-content-wrapper">
                {renderContent()}
            </div>
        </div>
    );
};

export default PacienteTabs;