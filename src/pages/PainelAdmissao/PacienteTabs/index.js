// src/components/PacienteTabs.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../PacienteTabs/style.css';
import { useProfissoes } from '../../../components/util/utilitarios'; // HOOK DA API
import { habiliatacaLiterariaFONTE, estadoCivilFONTE } from '../../../components/util/utilitarios'; // MANTIDOS
import { api } from '../../../service/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { Card, Row, Col, Select, Input, Button, Tag, Divider, Popconfirm, Space, Table } from 'antd';
import { HomeOutlined, FileTextOutlined, HeartOutlined, InsuranceOutlined, BankOutlined, PlusOutlined, CheckOutlined, CloseOutlined, LoadingOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useGeoData } from '../../../hooks/useGeoData'; // Caminho correto

const { Option } = Select;

const PacienteTabs = (props) => {
    const { pacienteId, handleChange } = props;
    const [activeTab, setActiveTab] = useState('endereco');
    const tabsRef = useRef({});
    const indicatorRef = useRef(null);

    const { countries, getStatesByCountry, getCitiesByState, loading: geoLoading } = useGeoData();
    const { profissoes, loading: profLoading } = useProfissoes(); // API DE PROFISSÕES

    const [seguradoras, setSeguradoras] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [empresaSelecionada, setEmpresaSelecionada] = useState(props.empresaId || '');

    const [novoConvenio, setNovoConvenio] = useState({ seguradoraId: null, numeroCartao: '', validade: '', empresaId: null });
    const [conveniosPaciente, setConveniosPaciente] = useState([]);
    const [loadingConvenios, setLoadingConvenios] = useState(false);

    const [mostrarFormNovaSeguradora, setMostrarFormNovaSeguradora] = useState(false);
    const [editandoSeguradora, setEditandoSeguradora] = useState(null);
    const [loadingSeguradora, setLoadingSeguradora] = useState(false);
    const [novaSeguradora, setNovaSeguradora] = useState({ nome: '', nif: '', telefone: '', email: '', endereco: '', empresaId: null, status: true });

    const tabConfig = [
        { key: 'endereco', label: 'Endereço', icon: <HomeOutlined /> },
        { key: 'fiscal', label: 'Fiscal', icon: <FileTextOutlined /> },
        { key: 'nascimento', label: 'Nascimento', icon: <HeartOutlined /> },
        { key: 'seguradora', label: 'Convênio', icon: <InsuranceOutlined />, badge: conveniosPaciente.length },
        { key: 'empresa', label: 'Empresa', icon: <BankOutlined /> },
    ];

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
            if (!pacienteId) return;
            setLoadingConvenios(true);
            try {
                const res = await api.get(`/pacienteSeguradora/all/${pacienteId}`);
                setConveniosPaciente(res.data || []);
            } catch (err) {
                setConveniosPaciente([]);
            } finally {
                setLoadingConvenios(false);
            }
        };
        fetchConvenios();
    }, [pacienteId]);

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

    const adicionarConvenio = async () => {
        if (!novoConvenio.seguradoraId) return toast.warn('Selecione uma seguradora.');
        const now = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        const payload = {
            seguradoraId: novoConvenio.seguradoraId,
            pacienteId,
            numeroCartao: novoConvenio.numeroCartao || null,
            dataValidade: novoConvenio.validade ? `${novoConvenio.validade}-01` : null,
            dataCricao: now,
            dataActualizacao: now,
            usuarioIdCricao: 1,
            usuarioIdAtualizacao: 1,
            empresaId: novoConvenio.empresaId || null
        };

        try {
            await api.post('/pacienteSeguradora/add', payload);
            const res = await api.get(`/pacienteSeguradora/all/${pacienteId}`);
            setConveniosPaciente(res.data);
            toast.success('Convênio adicionado!');
            setNovoConvenio({ seguradoraId: null, numeroCartao: '', validade: '', empresaId: null });
        } catch (error) {
            toast.error('Erro ao adicionar convênio.');
        }
    };

    const excluirConvenio = async (id) => {
        try {
            await api.delete(`/pacienteSeguradora/${id}`);
            setConveniosPaciente(prev => prev.filter(c => c.id !== id));
            toast.success('Convênio removido.');
        } catch (error) {
            toast.error('Erro ao remover convênio.');
        }
    };

    const handleCadastrarSeguradora = async () => {
        if (!novaSeguradora.nome.trim()) return toast.warn('Nome é obrigatório!');
        setLoadingSeguradora(true);
        try {
            const payload = { ...novaSeguradora };
            let res;
            if (editandoSeguradora) {
                res = await api.put(`/seguradora/${editandoSeguradora.id}`, payload);
                toast.success('Seguradora atualizada!');
            } else {
                res = await api.post('/seguradora/add', payload);
                toast.success('Seguradora cadastrada!');
            }
            setSeguradoras(prev => editandoSeguradora ? prev.map(s => s.id === editandoSeguradora.id ? res.data : s) : [...prev, res.data]);
            setMostrarFormNovaSeguradora(false);
            setEditandoSeguradora(null);
            setNovaSeguradora({ nome: '', nif: '', telefone: '', email: '', endereco: '', empresaId: null, status: true });
        } catch (error) {
            toast.error('Erro ao salvar seguradora.');
        } finally {
            setLoadingSeguradora(false);
        }
    };

    const columns = [
        { title: 'Seguradora', render: (_, r) => seguradoras.find(s => s.id === r.seguradoraId)?.nome || '—' },
        { title: 'Nº Cartão', dataIndex: 'numeroCartao', render: t => t || '—' },
        { title: 'Validade', dataIndex: 'dataValidade', render: d => d ? format(new Date(d), 'MM/yyyy') : '—' },
        { title: 'Ações', render: (_, r) => (
            <Popconfirm title="Excluir?" onConfirm={() => excluirConvenio(r.id)}>
                <DeleteOutlined style={{ color: '#ff4d4f', cursor: 'pointer' }} />
            </Popconfirm>
        )}
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'endereco':
                return (
                    <div className="tab-content">
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <div className="form-group">
                                    <label>País:</label>
                                    <Select
                                        showSearch
                                        optionFilterProp="children"
                                        loading={geoLoading}
                                        value={props.paisEndereco}
                                        onChange={v => {
                                            handleChange('paisEndereco', v);
                                            handleChange('provinciaEndereco', '');
                                            handleChange('municipioEndereco', '');
                                        }}
                                        style={{ width: '100%' }}
                                        placeholder="Selecione o país"
                                    >
                                        <Option value="">Selecione</Option>
                                        {countries.map(c => (
                                            <Option key={c.id} value={c.name}>{c.name}</Option>
                                        ))}
                                    </Select>
                                </div>
                            </Col>
                            <Col xs={24} md={12}>
                                <div className="form-group">
                                    <label>Província:</label>
                                    <Select
                                        showSearch
                                        disabled={!props.paisEndereco}
                                        loading={geoLoading}
                                        value={props.provinciaEndereco}
                                        onChange={v => {
                                            handleChange('provinciaEndereco', v);
                                            handleChange('municipioEndereco', '');
                                        }}
                                        style={{ width: '100%' }}
                                        placeholder="Selecione a província"
                                    >
                                        <Option value="">Selecione</Option>
                                        {props.paisEndereco && getStatesByCountry(props.paisEndereco).map(s => (
                                            <Option key={s.id} value={s.name}>{s.name}</Option>
                                        ))}
                                    </Select>
                                </div>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <div className="form-group">
                                    <label>Município:</label>
                                    <Select
                                        showSearch
                                        disabled={!props.provinciaEndereco}
                                        loading={geoLoading}
                                        value={props.municipioEndereco}
                                        onChange={v => handleChange('municipioEndereco', v)}
                                        style={{ width: '100%' }}
                                        placeholder="Selecione o município"
                                    >
                                        <Option value="">Selecione</Option>
                                        {props.provinciaEndereco && getCitiesByState(props.provinciaEndereco, props.paisEndereco).map(c => (
                                            <Option key={c.id} value={c.name}>{c.name}</Option>
                                        ))}
                                    </Select>
                                </div>
                            </Col>
                            <Col xs={24} md={12}>
                                <div className="form-group">
                                    <label>Endereço:</label>
                                    <Input value={props.endereco} onChange={e => handleChange('endereco', e.target.value)} />
                                </div>
                            </Col>
                        </Row>
                    </div>
                );

            case 'fiscal':
                return (
                    <div className="tab-content">
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <div className="form-group">
                                    <label>Profissão:</label>
                                    <Select
                                        showSearch
                                        loading={profLoading}
                                        value={props.profissao}
                                        onChange={v => handleChange('profissao', v)}
                                        style={{ width: '100%' }}
                                        placeholder="Selecione"
                                    >
                                        <Option value="">--Selecione--</Option>
                                        {profissoes.map(p => (
                                            <Option key={p.id} value={p.value}>{p.value}</Option>
                                        ))}
                                    </Select>
                                </div>
                            </Col>
                            <Col xs={24} md={12}>
                                <div className="form-group">
                                    <label>Habilitação Literária:</label>
                                    <Select
                                        value={props.habilitacao}
                                        onChange={v => handleChange('habilitacao', v)}
                                        style={{ width: '100%' }}
                                    >
                                        <Option value="">--Selecione--</Option>
                                        {habiliatacaLiterariaFONTE.map(i => (
                                            <Option key={i.id} value={i.value}>{i.value}</Option>
                                        ))}
                                    </Select>
                                </div>
                            </Col>
                        </Row>
                        <div className="form-group">
                            <label>Estado Civil:</label>
                            <Select
                                value={props.estadoCivil}
                                onChange={v => handleChange('estadoCivil', v)}
                                style={{ width: '100%' }}
                            >
                                <Option value="">--Selecione--</Option>
                                {estadoCivilFONTE.map(i => (
                                    <Option key={i.id} value={i.value}>{i.value}</Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                );

            case 'nascimento':
                return (
                    <div className="tab-content">
                        <Row gutter={16}>
                            <Col xs={24} md={8}><div className="form-group"><label>Pai:</label><Input value={props.pai} onChange={e => handleChange('pai', e.target.value)} /></div></Col>
                            <Col xs={24} md={8}><div className="form-group"><label>Mãe:</label><Input value={props.mae} onChange={e => handleChange('mae', e.target.value)} /></div></Col>
                            <Col xs={24} md={8}><div className="form-group"><label>Data de Nascimento:</label><Input type="date" value={props.dataNascimento} onChange={e => handleChange('dataNascimento', e.target.value)} /></div></Col>
                        </Row>
                        <Row gutter={16}>
                            <Col xs={24} md={8}>
                                <div className="form-group">
                                    <label>País:</label>
                                    <Select
                                        showSearch
                                        loading={geoLoading}
                                        value={props.paisNascimento}
                                        onChange={v => {
                                            handleChange('paisNascimento', v);
                                            handleChange('provinciaNascimento', '');
                                            handleChange('municipioNascimento', '');


                                        }}
                                        style={{ width: '100%' }}
                                    >
                                        <Option value="">Selecione</Option>
                                        {countries.map(c => <Option key={c.id} value={c.name}>{c.name}</Option>)}
                                    </Select>
                                </div>
                            </Col>
                            <Col xs={24} md={8}>
                                <div className="form-group">
                                    <label>Província:</label>
                                    <Select
                                        showSearch
                                        disabled={!props.paisNascimento}
                                        loading={geoLoading}
                                        value={props.provinciaNascimento}
                                        onChange={v => {
                                            handleChange('provinciaNascimento', v);
                                            handleChange('municipioNascimento', '');
                                        }}
                                        style={{ width: '100%' }}
                                    >
                                        <Option value="">Selecione</Option>
                                        {props.paisNascimento && getStatesByCountry(props.paisNascimento).map(s => (
                                            <Option key={s.id} value={s.name}>{s.name}</Option>
                                        ))}
                                    </Select>
                                </div>
                            </Col>
                            <Col xs={24} md={8}>
                                <div className="form-group">
                                    <label>Município:</label>
                                    <Select
                                        showSearch
                                        disabled={!props.provinciaNascimento}
                                        loading={geoLoading}
                                        value={props.municipioNascimento}
                                        onChange={v => handleChange('municipioNascimento', v)}
                                        style={{ width: '100%' }}
                                    >
                                        <Option value="">Selecione</Option>
                                        {props.provinciaNascimento && getCitiesByState(props.provinciaNascimento, props.paisNascimento).map(c => (
                                            <Option key={c.id} value={c.name}>{c.name}</Option>
                                        ))}
                                    </Select>
                                </div>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <div className="form-group">
                                    <label>Local de Nascimento:</label>
                                    <Input value={props.localNascimento} onChange={e => handleChange('localNascimento', e.target.value)} placeholder="Ex: Hospital, Casa, etc." />
                                </div>
                            </Col>
                            <Col xs={24} md={12}>
                                <div className="form-group">
                                    <label>Nacionalidade:</label>
                                    <Select
                                        showSearch
                                        loading={geoLoading}
                                        value={props.nacionalidade}
                                        onChange={v => handleChange('nacionalidade', v)}
                                        style={{ width: '100%' }}
                                        placeholder="Selecione"
                                    >
                                        <Option value="">Selecione</Option>
                                        {countries.map(c => (
                                            <Option key={c.id} value={c.nationality || c.name}>
                                                {c.nationality || c.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                            </Col>
                        </Row>
                    </div>
                );

            case 'seguradora':
                return (
                    <div className="tab-content">
                        <h4>Adicionar Convênio</h4>
                        <Row gutter={16}>
                            <Col xs={24} md={8}>
                                <Select
                                    showSearch
                                    placeholder="Seguradora"
                                    value={novoConvenio.seguradoraId}
                                    onChange={v => setNovoConvenio(p => ({ ...p, seguradoraId: v }))}
                                    style={{ width: '100%' }}
                                    dropdownRender={menu => (
                                        <>
                                            {menu}
                                            <Divider style={{ margin: '4px 0' }} />
                                            <Button type="text" icon={<PlusOutlined />} onClick={() => setMostrarFormNovaSeguradora(true)}>
                                                Nova
                                            </Button>
                                        </>
                                    )}
                                >
                                    {seguradoras.map(s => (
                                        <Option key={s.id} value={s.id}>{s.nome}</Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col xs={24} md={6}>
                                <Input placeholder="Nº Cartão" value={novoConvenio.numeroCartao} onChange={e => setNovoConvenio(p => ({ ...p, numeroCartao: e.target.value }))} />
                            </Col>
                            <Col xs={24} md={6}>
                                <Input type="month" value={novoConvenio.validade} onChange={e => setNovoConvenio(p => ({ ...p, validade: e.target.value }))} />
                            </Col>
                            <Col xs={24} md={4}>
                                <Button type="primary" onClick={adicionarConvenio} style={{ marginTop: 0 }}>
                                    Adicionar
                                </Button>
                            </Col>
                        </Row>

                        <Divider />

                        {loadingConvenios ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <LoadingOutlined style={{ fontSize: 24 }} spin />
                            </div>
                        ) : (
                            <Table dataSource={conveniosPaciente} columns={columns} rowKey="id" pagination={false} />
                        )}

                        {mostrarFormNovaSeguradora && (
                            <Card size="small" style={{ marginTop: 16 }}>
                                <h5>Nova Seguradora</h5>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Input placeholder="Nome *" value={novaSeguradora.nome} onChange={e => setNovaSeguradora(p => ({ ...p, nome: e.target.value }))} />
                                    </Col>
                                    <Col span={12}>
                                        <Select placeholder="Empresa" value={novaSeguradora.empresaId} onChange={v => setNovaSeguradora(p => ({ ...p, empresaId: v }))} style={{ width: '100%' }}>
                                            {empresas.map(e => (
                                                <Option key={e.id} value={e.id}>{e.nome}</Option>
                                            ))}
                                        </Select>
                                    </Col>
                                </Row>
                                <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                                    <Button type="primary" onClick={handleCadastrarSeguradora} loading={loadingSeguradora}>
                                        Cadastrar
                                    </Button>
                                    <Button danger onClick={() => {
                                        setMostrarFormNovaSeguradora(false);
                                        setNovaSeguradora({ nome: '', nif: '', telefone: '', email: '', endereco: '', empresaId: null, status: true });
                                    }}>
                                        Cancelar
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>
                );

            case 'empresa':
                return (
                    <div className="tab-content">
                        <Select
                            showSearch
                            style={{ width: '100%' }}
                            value={empresaSelecionada}
                            onChange={v => {
                                setEmpresaSelecionada(v);
                                handleChange('empresaId', v);
                            }}
                            placeholder="Selecione empresa"
                        >
                            {empresas.map(e => (
                                <Option key={e.id} value={e.id}>{e.nome}</Option>
                            ))}
                        </Select>
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
                            {tab.badge > 0 && <span className="tab-badge">{tab.badge}</span>}
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