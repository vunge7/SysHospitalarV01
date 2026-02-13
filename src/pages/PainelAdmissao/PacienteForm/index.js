// src/pages/PacienteForm.jsx
import React, { useState, useEffect } from 'react';
import './style.css';
import PacienteTabs from '../PacienteTabs';
import { api } from '../../../service/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { Card, Row, Col, Input, Select, Button, Upload, Avatar, Spin } from 'antd';
import { UploadOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';

const { Option } = Select;

const PacienteForm = () => {
    const [form, setForm] = useState({
        nif: '', nome: '', apelido: '', paisEndereco: '', provinciaEndereco: '',
        municipioEndereco: '', endereco: '', profissao: '', habilitacao: '',
        estadoCivil: '', paisNascimento: '', provinciaNascimento: '',
        municipioNascimento: '', dataNascimento: '', localNascimento: '',
        nacionalidade: '', genero: '', raca: '', pai: '', mae: '', empresaId: '',
    });

    const [photo, setPhoto] = useState(null);
    const [nifPesquisa, setNifPesquisa] = useState('');
    const [idPesquisa, setIdPesquisa] = useState('');
    const [idPaciente, setIdPaciente] = useState(0);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [paciente, setPaciente] = useState({});
    const [conveniosPendentes, setConveniosPendentes] = useState([]);

    useEffect(() => {
        const fetchLastQr = async () => {
            try {
                const response = await api.get('/api/qr-data');
                if (response.data?.pacienteId) {
                    const id = response.data.pacienteId;
                    const r = await api.get(`paciente/${id}`);
                    toast.dismiss();
                    setPaciente(r.data);
                    preencherFormulario(r.data);
                    await carregarFoto(r.data.nomePhoto);
                    await api.delete('/api/qr-data').catch(() => {});
                }
            } catch (error) {
                if (error.response?.status !== 404) console.warn('Erro QR:', error);
            }
        };

        fetchLastQr();
        const interval = setInterval(fetchLastQr, 3000);
        return () => clearInterval(interval);
    }, []);

    const preencherFormulario = (data) => {
        setForm(prev => ({
            ...prev,
            nome: data.nome || '',
            nif: data.nif || '',
            apelido: data.apelido || '',
            paisEndereco: data.paisEndereco || '',
            provinciaEndereco: data.provinciaEndereco || '',
            municipioEndereco: data.municipioEndereco || '',
            endereco: data.endereco || '',
            profissao: data.profissao || '',
            habilitacao: data.habilitacao || '',
            estadoCivil: data.estadoCivil || '',
            paisNascimento: data.paisNascimento || '',
            provinciaNascimento: data.provinciaNascimento || '',
            municipioNascimento: data.municipioNascimento || '',
            dataNascimento: data.dataNascimento ? data.dataNascimento.split('T')[0] : '',
            localNascimento: data.localNascimento || '',
            nacionalidade: data.nacionalidade || '',
            genero: data.genero || '',
            raca: data.raca || '',
            pai: data.pai || '',
            mae: data.mae || '',
            empresaId: data.empresaId || '',
        }));
    };

    const carregarFoto = async (nomePhoto) => {
        if (nomePhoto) {
            const imageUrl = `/images/${nomePhoto}`;
            try {
                const blobRes = await api.get(imageUrl, { responseType: 'blob' });
                setPhotoPreview(URL.createObjectURL(blobRes.data));
            } catch (err) {
                console.warn('Foto não encontrada:', err);
                setPhotoPreview(null);
            }
        }
    };

    const handleChange = (name, value) => {
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        handleChange(name, value);
    };

    const handlePhotoChange = ({ file }) => {
        setPhoto(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setPhotoPreview(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!form.nif) newErrors.nif = 'NIF obrigatório.';
        if (!form.nome) newErrors.nome = 'Nome obrigatório.';
        if (!form.apelido) newErrors.apelido = 'Apelido obrigatório.';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        api.get(`pessoa/nif/${form.nif}`)
            .then(r => {
                if (isEmpty(r.data)) {
                    registrarPessoa();
                } else {
                    toast.error('NIF já cadastrado.');
                }
            })
            .catch(() => toast.error('Erro ao verificar NIF.'));
    };

    const registrarPessoa = async () => {
        try {
            const formData = new FormData();
            
            formData.append('nome', form.nome);
            formData.append('apelido', form.apelido);
            formData.append('nif', form.nif);
            formData.append('empresaId', form.empresaId || '1'); 
            
            if (form.dataNascimento) {
                const dataFormatada = new Date(form.dataNascimento).toISOString().slice(0, 19).replace('T', ' ');
                formData.append('dataNascimento', dataFormatada);
            }
            
            const camposOpcionais = [
                'paisEndereco', 'provinciaEndereco', 'municipioEndereco', 'endereco',
                'profissao', 'habilitacao', 'estadoCivil', 'paisNascimento', 
                'provinciaNascimento', 'municipioNascimento', 'localNascimento',
                'nacionalidade', 'genero', 'raca', 'pai', 'mae', 'telefone', 'email'
            ];
            
            camposOpcionais.forEach(campo => {
                if (form[campo]) {
                    formData.append(campo, form[campo]);
                }
            });
            
            const r = await api.post('pessoa/add', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const pessoaId = r.data.id;
            await criarPaciente(pessoaId);
        } catch (err) {
            console.error('Erro ao criar pessoa:', err);
            console.error('Response data:', err.response?.data);
            toast.error(err.response?.data?.message || 'Falha ao criar pessoa.');
        }
    };

    const criarPaciente = async (pessoaId) => {
        try {
            const now = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
            const pacienteData = {
                pessoaId,
                empresaId: form.empresaId ? parseInt(form.empresaId) : null,
                dataCadastro: now,
                dataActualizacao: now,
            };
            const r = await api.post('paciente/add', pacienteData);
            const novoPaciente = r.data;
            setIdPaciente(novoPaciente.id);
            setPaciente(novoPaciente);
            await savePhotoUpload(pessoaId);
            toast.success('Paciente cadastrado com sucesso!', { autoClose: 2000 });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Falha ao cadastrar paciente.');
        }
    };

    const actualizarPaciente = async () => {
        if (!paciente.id) return toast.warn('Nenhum paciente para atualizar.');
        try {
            const now = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
            const dadosAtualizados = {
                id: paciente.id,
                pessoaId: paciente.pessoaId,
                empresaId: form.empresaId ? parseInt(form.empresaId) : null,
                dataActualizacao: now,
            };
            await api.put('paciente/edit', dadosAtualizados);
            await actualizarPessoa(paciente.pessoaId);
            toast.success('Paciente atualizado com sucesso!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Falha ao atualizar paciente.');
        }
    };

    const actualizarPessoa = async (pessoaId) => {
        const formComId = { ...form, id: pessoaId };
        try {
            await api.put(`pessoa/edit/${pessoaId}`, formComId);
        } catch (err) {
            console.error('Erro ao atualizar pessoa:', err);
            throw err;
        }
    };

    const savePhotoUpload = async (pessoaId) => {
        if (!photo) return;
        const formData = new FormData();
        formData.append('image', photo);
        formData.append('pessoaId', pessoaId);
        try {
            await api.post('api/images/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Foto salva!');
        } catch (err) {
            toast.warn('Erro ao salvar foto.');
        }
    };

    const novaInscricao = async () => {
        console.log('=== INÍCIO DA FUNÇÃO novaInscricao ===');
        console.log('ID do paciente:', paciente.id);
        
        if (!paciente.id) {
            console.error('ERRO: Paciente não tem ID');
            return toast.warn('Cadastre o paciente primeiro!');
        }
        
        if (!paciente.empresaId) {
            console.error('ERRO: Paciente não tem empresaId');
            return toast.warn('Paciente não tem empresa cadastrada!');
        }
        
        const inscricao = {
            dataCriacao: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            dataActualizacao: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            estadoInscricao: 'NAO_TRIADO',
            condicaoInscricao: 'ABERTO',
            encaminhamento: 'CONSULTORIO',
            obsTriagemManchester: '',
            pacienteId: Number(paciente.id),
            empresaId: Number(paciente.empresaId),
            corTriagemManchester: null,
            minutoEsperaTriagemManchester: null,
        };
        
        console.log('Dados da inscrição a serem enviados:', JSON.stringify(inscricao, null, 2));
        
        try {
            console.log('=== FAZENDO REQUISIÇÃO POST /inscricao/add ===');
            await api.post('inscricao/add', inscricao);
            console.log('=== SUCESSO ===');
            toast.success('Inscrição criada!');
        } catch (err) {
            console.error('=== ERRO ===');
            console.error('Erro:', err);
            console.error('Response:', err.response?.data);
            console.error('Status:', err.response?.status);
            toast.error('Falha ao criar inscrição: ' + (err.response?.data?.message || err.message));
        }
    };

    const limparFormulario = () => {
        setForm({
            nif: '', nome: '', apelido: '', paisEndereco: '', provinciaEndereco: '',
            municipioEndereco: '', endereco: '', profissao: '', habilitacao: '',
            estadoCivil: '', paisNascimento: '', provinciaNascimento: '',
            municipioNascimento: '', dataNascimento: '', localNascimento: '',
            nacionalidade: '', genero: '', raca: '', pai: '', mae: '', empresaId: ''
        });
        setPhoto(null);
        setPhotoPreview(null);
        setErrors({});
        setPaciente({});
        setIdPaciente(0);
        setConveniosPendentes([]);
    };

    const handleKeyDownID = async (e) => {
        if (e.key === 'Enter' && idPesquisa) {
            try {
                const r = await api.get(`paciente/${idPesquisa}`);
                toast.dismiss();
                setPaciente(r.data);
                setIdPaciente(r.data.id);
                preencherFormulario(r.data);
                await carregarFoto(r.data.nomePhoto);
            } catch (err) {
                limparFormulario();
                toast.info('Paciente não encontrado.');
            }
            setIdPesquisa('');
        }
    };

    const handleKeyDownNIF = async (e) => {
        if (e.key === 'Enter' && nifPesquisa) {
            await buscarPorNIF();
        }
    };

    const buscarPorNIF = async () => {
        if (!nifPesquisa) return;
        
        try {
            const r = await api.get(`pessoa/nif/${nifPesquisa}`);
            toast.dismiss();
            
            if (r.data && r.data.id) {
                // Buscar paciente pelo pessoaId
                const pacienteResponse = await api.get(`paciente/pessoa/${r.data.id}`);
                if (pacienteResponse.data && pacienteResponse.data.id) {
                    setPaciente(pacienteResponse.data);
                    setIdPaciente(pacienteResponse.data.id);
                    preencherFormulario(r.data);
                    await carregarFoto(r.data.nomePhoto);
                    toast.success('Paciente encontrado!');
                } else {
                    limparFormulario();
                    toast.info('Pessoa encontrada mas não possui cadastro de paciente.');
                }
            } else {
                limparFormulario();
                toast.info('Paciente não encontrado.');
            }
        } catch (err) {
            limparFormulario();
            toast.info('Paciente não encontrado.');
        }
        setNifPesquisa('');
    };

    const isEmpty = (obj) => Object.keys(obj).length === 0;

    return (
        <div className="patient-form">
            <Spin spinning={false}>
                <Card className="search-card">
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Input
                                prefix={<SearchOutlined />}
                                placeholder="Pesquisa pelo ID"
                                value={idPesquisa}
                                onChange={(e) => setIdPesquisa(e.target.value)}
                                onKeyDown={handleKeyDownID}
                                addonAfter={<Button type="link" size="small">Buscar</Button>}
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <Input
                                placeholder="Pesquisa pelo NIF"
                                value={nifPesquisa}
                                onChange={(e) => setNifPesquisa(e.target.value)}
                                onKeyDown={handleKeyDownNIF}
                                addonAfter={<Button type="link" size="small" onClick={() => buscarPorNIF()}>Buscar</Button>}
                            />
                        </Col>
                    </Row>
                </Card>

                <form onSubmit={handleSubmit}>
                    <div className="top-buttons">
                        <Button type="primary" htmlType="submit">Criar Ficha</Button>
                        <Button 
                            onClick={actualizarPaciente}
                            disabled={!paciente.id}
                        >
                            Atualizar
                        </Button>
                        <Button onClick={novaInscricao}>Nova Inscrição</Button>
                        <Button danger onClick={limparFormulario}>Limpar</Button>
                    </div>

                    <h3>Ficha do Paciente</h3>

                    <Row gutter={24} className="form-main">
                        <Col xs={24} lg={16} className="form-left">
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <div className="form-group">
                                        <label>* Nome:</label>
                                        <Input name="nome" value={form.nome} onChange={handleInputChange} />
                                        {errors.nome && <span className="error">{errors.nome}</span>}
                                    </div>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <div className="form-group">
                                        <label>* Sexo:</label>
                                        <Select value={form.genero} onChange={v => handleChange('genero', v)} style={{ width: '100%' }}>
                                            <Option value="">---</Option>
                                            <Option value="MASCULINO">Masculino</Option>
                                            <Option value="FEMININO">Feminino</Option>
                                        </Select>
                                    </div>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <div className="form-group">
                                        <label>* Apelido:</label>
                                        <Input name="apelido" value={form.apelido} onChange={handleInputChange} />
                                        {errors.apelido && <span className="error">{errors.apelido}</span>}
                                    </div>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <div className="form-group">
                                        <label>Raça</label>
                                        <Select value={form.raca} onChange={v => handleChange('raca', v)} style={{ width: '100%' }}>
                                            <Option value="">---</Option>
                                            <Option value="Negra">Negra</Option>
                                            <Option value="Branca">Branca</Option>
                                            <Option value="Amarela">Amarela</Option>
                                            <Option value="Parda">Parda</Option>
                                            <Option value="Indígena">Indígena</Option>
                                        </Select>
                                    </div>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <div className="form-group">
                                        <label>* NIF:</label>
                                        <Input name="nif" value={form.nif} onChange={handleInputChange} />
                                        {errors.nif && <span className="error">{errors.nif}</span>}
                                    </div>
                                </Col>
                            </Row>
                        </Col>

                        <Col xs={24} lg={8} className="form-right">
                            <Card title="Foto do Paciente" style={{ textAlign: 'center' }}>
                                <Upload beforeUpload={() => false} onChange={handlePhotoChange} showUploadList={false} accept="image/*">
                                    {photoPreview ? (
                                        <Avatar size={140} src={photoPreview} />
                                    ) : (
                                        <Avatar size={140} icon={<UserOutlined />} />
                                    )}
                                </Upload>
                                <Upload beforeUpload={() => false} onChange={handlePhotoChange} showUploadList={false} accept="image/*">
                                    <Button icon={<UploadOutlined />} block style={{ marginTop: 16 }}>
                                        Selecionar Foto
                                    </Button>
                                </Upload>
                            </Card>
                        </Col>
                    </Row>

                    <PacienteTabs
                        key={paciente.id || idPaciente}
                        pacienteId={paciente.id || idPaciente}
                        endereco={form.endereco}
                        paisEndereco={form.paisEndereco}
                        provinciaEndereco={form.provinciaEndereco}
                        municipioEndereco={form.municipioEndereco}
                        paisNascimento={form.paisNascimento}
                        provinciaNascimento={form.provinciaNascimento}
                        municipioNascimento={form.municipioNascimento}
                        localNascimento={form.localNascimento}
                        dataNascimento={form.dataNascimento}
                        profissao={form.profissao}
                        habilitacao={form.habilitacao}
                        estadoCivil={form.estadoCivil}
                        pai={form.pai}
                        mae={form.mae}
                        nacionalidade={form.nacionalidade}
                        empresaId={form.empresaId}
                        conveniosPendentes={conveniosPendentes}
                        setConveniosPendentes={setConveniosPendentes}
                        handleChange={handleChange}
                        errors={errors}
                    />
                </form>
            </Spin>
        </div>
    );
};

export default PacienteForm;
