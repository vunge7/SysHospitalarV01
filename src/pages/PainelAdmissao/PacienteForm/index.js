import React, { useState, useEffect } from 'react';
import './style.css';
import PacienteTabs from '../PacienteTabs';
import { api } from '../../../service/api';
import { format } from 'date-fns'; // ✅ Correção
import { toast } from 'react-toastify';

const PacienteForm = () => {
    const [form, setForm] = useState({
        nif: '',
        nome: '',
        apelido: '',
        paisEndereco: '',
        provinciaEndereco: '',
        municipioEndereco: '',
        endereco: '',
        profissao: '', // ✅ Apenas um
        habilitacao: '',
        estadoCivil: '',
        paisNascimento: '',
        provinciaNascimento: '',
        municipioNascimento: '',
        dataNascimento: '',
        localNascimento: '',
        nacionalidade: '',
        genero: '',
        raca: '',
        pai: '',
        mae: '',
    });

    const [photo, setPhoto] = useState(null);
    const [nifPesquisa, setNifPesquisa] = useState('');
    const [idPesquisa, setIdPesquisa] = useState('');
    const [idPaciente, setIdPaciente] = useState(0);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [paciente, setPaciente] = useState({});

    useEffect(() => {
        const fetchLastQr = async () => {
            try {
                const response = await api.get('api/qr-data');
                if (response.data) {
                    let id = response.data.id;

                    await api
                        .get('paciente/' + id)
                        .then((r) => {
                            toast.dismiss();

                            setPaciente(r.data);
                            setForm((prevForm) => ({
                                ...prevForm,
                                nome: r.data.nome,
                                nif: r.data.nif,
                                apelido: r.data.apelido,
                                paisEndereco: r.data.paisEndereco,
                                provinciaEndereco: r.data.provinciaEndereco,
                                municipioEndereco: r.data.municipioEndereco,
                                endereco: r.data.endereco,
                                profissao: r.data.profissao,
                                habilitacao: r.data.habilitacao,
                                estadoCivil: r.data.estadoCivil,
                                paisNascimento: r.data.paisNascimento,
                                provinciaNascimento: r.data.provinciaNascimento,
                                municipioNascimento: r.data.municipioNascimento,
                                dataNascimento: r.data.dataNascimento,
                                localNascimento: r.data.localNascimento,
                                nacionalidade: r.data.nacionalidade,
                                genero: r.data.genero,
                                raca: r.data.raca,
                                pai: r.data.pai,
                                mae: r.data.mae,
                            }));
                        })
                        .catch(() => {
                            limparFormulario();
                            toast.info('Não existe paciente com este ID', {
                                autoClose: 2000,
                            });
                        });
                }

                await api.delete('api/qr-data');
            } catch (error) {
                console.log(`Erro ao buscar dados do QR Code: ${error}`);
                // Se não houver dado, apenas ignora
            }
        };
        fetchLastQr();
        const interval = setInterval(fetchLastQr, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        setPhoto(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!form.nif) newErrors.nif = 'Por favor insira o nif.';
        if (!form.nome) newErrors.nome = 'Por favor insira o nome.';
        if (!form.apelido) newErrors.apelido = 'Por favor insira o apelido.';
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        setForm((prevForm) => ({
            ...prevForm,
            dataNascimento: format(new Date(form.dataNascimento), 'yyyy-MM-dd'), // ✅ Correção
        }));

        console.log(form);

        /**
         * Verifica se existe uma pessoa que tem o mesmo nif
         */

        api.get(`pessoa/nif/${form.nif}`)
            .then(async (r) => {
                //senão existe: registra
                if (isEmpty(r.data)) {
                    await registrarPessoa();
                } else {
                    //caso contrário emite a mensagem de erro.
                    toast.error('Já existe um registro com este NIF');
                }
            })
            .catch((e) => {
                let msg = 'Falha ao tentar se comunicar com a API';
                console.error(msg, e);
                toast.error(msg);
            });
    };

    const registrarPessoa = async () => {
        await api
            .post('pessoa/add', form)
            .then(async (r) => {
                let pessoa = r.data;
                await criarPaciente(pessoa.id);
            })
            .catch(() => {
                toast.error('Falha ao criar o paciente!');
            });
    };

    const actualizarPessoa = async (id) => {
        const formComId = {
            ...form,
            id: id,
        };

        console.log(formComId);
        await api
            .put('pessoa/edit', formComId)
            .then(() => {
                toast.success('Paciente actualizado com sucesso!', {
                    autoClose: 2000,
                });
            })
            .catch(() => {
                toast.error('Falha ao actualizar os dados!');
            });
    };

    const criarPaciente = async (pessoaId) => {
        let paciente = {
            pessoaId: pessoaId,
        };
        await api
            .post('paciente/add', paciente)
            .then((r) => {
                setIdPaciente(r.data.id);
                savePhotoUpload(pessoaId);
                toast.success('Paciente adicionado com sucesso!', {
                    autoClose: 2000,
                });
            })
            .catch(() => {
                toast.error('Falha ao registrar o paciente!', {
                    autoClose: 2000,
                });
            });
    };

    const actualizarPaciente = async () => {
        await api
            .put('paciente/edit', paciente)
            .then(async () => {
                await actualizarPessoa(paciente.pessoaId);
            })
            .catch(() => {
                toast.error('Falha ao actualizar o paciente!', {
                    autoClose: 2000,
                });
            });
    };

    function isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }

    const limparFormulario = () => {
        const camposVazios = Object.keys(form).reduce((acc, key) => {
            acc[key] = '';
            return acc;
        }, {});
        setForm({ ...camposVazios });
        setPhoto(null);
        setPhotoPreview(null);
    };

    const handleKeyDownNIF = (e) => {
        if (e.key === 'Enter') {
            console.log('Pesquisando NIF:', nifPesquisa);
            setNifPesquisa('');
        }
    };

    const handleKeyDownID = async (e) => {
        if (e.key === 'Enter') {
            await api
                .get('paciente/' + idPesquisa)
                .then((r) => {
                    toast.dismiss();

                    setPaciente(r.data);
                    setForm((prevForm) => ({
                        ...prevForm,
                        nome: r.data.nome,
                        nif: r.data.nif,
                        apelido: r.data.apelido,
                        paisEndereco: r.data.paisEndereco,
                        provinciaEndereco: r.data.provinciaEndereco,
                        municipioEndereco: r.data.municipioEndereco,
                        endereco: r.data.endereco,
                        profissao: r.data.profissao,
                        habilitacao: r.data.habilitacao,
                        estadoCivil: r.data.estadoCivil,
                        paisNascimento: r.data.paisNascimento,
                        provinciaNascimento: r.data.provinciaNascimento,
                        municipioNascimento: r.data.municipioNascimento,
                        dataNascimento: r.data.dataNascimento,
                        localNascimento: r.data.localNascimento,
                        nacionalidade: r.data.nacionalidade,
                        genero: r.data.genero,
                        raca: r.data.raca,
                        pai: r.data.pai,
                        mae: r.data.mae,
                    }));

                    console.log(r.data.nomePhoto);

                    const imageUrl = `/images/${r.data.nomePhoto}`;

                    let file = async () => {
                        try {
                            const response = await api.get(imageUrl, {
                                responseType: 'blob',
                            });
                            const imageBlob = response.data;
                            const imageObjectURL =
                                URL.createObjectURL(imageBlob);
                            setPhotoPreview(imageObjectURL);
                        } catch (error) {
                            console.error(
                                'Erro ao buscar a imagem do paciente:',
                                error
                            );
                            setPhotoPreview(null);
                        }
                    };
                    console.log(file);
                })
                .catch(() => {
                    limparFormulario();
                    toast.info('Não existe paciente com este ID', {
                        autoClose: 2000,
                    });
                });

            setIdPesquisa('');
        }
    };

    const savePhotoUpload = async (pessoaId) => {
        const formData = new FormData();
        formData.append('image', photo);
        formData.append('pessoaId', pessoaId);

        try {
            const response = await api.post('api/images/upload', formData);
            alert('Imagem enviada! Nome salvo: ' + response.data);
        } catch (error) {
            alert('Erro ao enviar imagem');
        }
    };

    /**Funcção anónima que cria a inscrição ou epsódifo do paciente */
    const novaInscricao = async () => {
        let inscricao = {
            dataCriacao: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            dataActualizacao: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            estadoInscricao: 'NAO_TRIADO',
            condicaoInscricao: 'ABERTO',
            encaminhamento: 'EM_ESPERA',
            obsTriagemManchester: '',
            pacienteId: paciente.id,
        };
        console.log('InscricaoId', inscricao);

        await api
            .post('inscricao/add', inscricao)
            .then((r) => {
                console.log('Inscricao criada com sucesso!..');
                toast.success('Inscricao criada com sucesso!..', {
                    autoClose: 2000,
                });
            })
            .catch((e) => {
                console.log(e);
                toast.error('Falha ao inscrever o paciente', {
                    autoClose: 2000,
                });
            });
    };

    return (
        <>
            <div className="search-group">
                <div className="item">
                    <input
                        value={idPesquisa}
                        onChange={(e) => setIdPesquisa(e.target.value)}
                        placeholder="Pesquisa pelo ID"
                        onKeyDown={handleKeyDownID}
                    />
                </div>
                <div className="item">
                    <input
                        type="text"
                        placeholder="Pesquisa pelo NIF"
                        value={nifPesquisa}
                        onChange={(e) => setNifPesquisa(e.target.value)}
                        onKeyDown={handleKeyDownNIF}
                    />
                </div>
            </div>
            <form className="patient-form" onSubmit={handleSubmit}>
                <div className="buttons top-buttons">
                    <button type="submit">Criar Ficha</button>
                    <button type="button" onClick={actualizarPaciente}>
                        Actualizar
                    </button>
                    <button type="button" onClick={novaInscricao}>
                        Nova Inscrição
                    </button>
                    <button type="button">Visualizar</button>
                    <button type="button" onClick={limparFormulario}>
                        Limpar
                    </button>
                </div>

                <h3>Ficha do Paciente</h3>

                <div style={{ display: 'flex', gap: '32px' }}>
                    <div className="form-left" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>* Nome:</label>
                                <input
                                    name="nome"
                                    value={form.nome}
                                    onChange={handleChange}
                                />
                                {errors.nome && (
                                    <span className="error">{errors.nome}</span>
                                )}
                            </div>

                            <div
                                className="form-group"
                                style={{ width: '200px' }}
                            >
                                <label>* Sexo:</label>
                                <select
                                    name="genero"
                                    value={form.genero}
                                    onChange={handleChange}
                                >
                                    <option value="">---Selecione---</option>
                                    <option value="MASCULINO">Masculino</option>
                                    <option value="FEMININO">Feminino</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>* Apelido:</label>
                            <input
                                name="apelido"
                                value={form.apelido}
                                onChange={handleChange}
                            />
                            {errors.apelido && (
                                <span className="error">{errors.apelido}</span>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>* Nif:</label>
                                <input
                                    name="nif"
                                    value={form.nif}
                                    onChange={handleChange}
                                />
                                {errors.nif && (
                                    <span className="error">{errors.nif}</span>
                                )}
                            </div>

                            <div
                                className="form-group"
                                style={{ width: '200px' }}
                            >
                                <label>Raça</label>
                                <select
                                    name="raca"
                                    value={form.raca}
                                    onChange={handleChange}
                                >
                                    <option value="">---Selecione---</option>
                                    <option value="Negra">
                                        Negra (Africana)
                                    </option>
                                    <option value="Branca">
                                        Branca (Europeia)
                                    </option>
                                    <option value="Amarela">
                                        Amarela (Asiática)
                                    </option>
                                    <option value="Parda">
                                        Parda (Mestiça)
                                    </option>
                                    <option value="Indígena">
                                        Indígena (Nativa)
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div
                        className="form-right"
                        style={{ width: '180px', textAlign: 'center' }}
                    >
                        <label>Foto do Paciente:</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                        />
                        {photoPreview && (
                            <img
                                src={photoPreview}
                                alt="Pré-visualização"
                                style={{
                                    width: '150px',
                                    height: '150px',
                                    marginTop: '10px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                }}
                            />
                        )}
                    </div>
                </div>

                <PacienteTabs
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
                    handleChange={handleChange}
                    errors={errors}
                />
            </form>
        </>
    );
};

export default PacienteForm;
