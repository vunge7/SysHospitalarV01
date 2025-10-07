import React, { useEffect, useState, useRef } from 'react';
import { AutoComplete, Select, Input } from 'antd';
import { toast } from 'react-toastify';

import {
    Modal,
    Flex,
    Card,
    Row,
    Col,
    Slider,
    InputNumber,
    Radio,
    Space,
} from 'antd';
import TriagemManchester from '../TriagemManchester';
import { api } from '../../service/api';
import { format, set } from 'date-fns';

export const viewPdf = async (fileName, id) => {
    // Abrir uma nova aba imediatamente
    const newWindow = window.open('', '_blank');
    if (!newWindow) {
        alert('Permita pop-ups no navegador para visualizar o PDF.');
        return;
    }
    try {
        const response = await api.get('/api/pdf/' + fileName + '/' + id, {
            responseType: 'blob', // Para lidar com arquivos binários
        });

        // Verificar se o conteúdo do blob é um PDF válido
        if (response.headers['content-type'] !== 'application/pdf') {
            newWindow.close();
            alert('O arquivo carregado não é um PDF válido.');
            return;
        }

        // Criar uma URL para o PDF
        const pdfBlob = new Blob([response.data], {
            type: 'application/pdf',
        });
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Redirecionar a nova aba para a URL do PDF
        newWindow.location.href = pdfUrl;
    } catch (error) {
        newWindow.close(); // Fechar a aba se algo der errado
        console.error('Erro ao carregar o PDF:', error);
    }
};

export const viewPdfPacienteFita = async (fileName, id) => {
    // Abrir uma nova aba imediatamente
    const newWindow = window.open('', '_blank');
    if (!newWindow) {
        alert('Permita pop-ups no navegador para visualizar o PDF.');
        return;
    }
    try {
        const response = await api.get('/api/pdf/' + fileName + '/fita/' + id, {
            responseType: 'blob', // Para lidar com arquivos binários
        });

        // Verificar se o conteúdo do blob é um PDF válido
        if (response.headers['content-type'] !== 'application/pdf') {
            newWindow.close();
            alert('O arquivo carregado não é um PDF válido.');
            return;
        }

        // Criar uma URL para o PDF
        const pdfBlob = new Blob([response.data], {
            type: 'application/pdf',
        });
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Redirecionar a nova aba para a URL do PDF
        newWindow.location.href = pdfUrl;
    } catch (error) {
        newWindow.close(); // Fechar a aba se algo der errado
        console.error('Erro ao carregar o PDF:', error);
    }
};

export const viewPdfGenerico = async (fileName, id) => {
    // Abrir uma nova aba imediatamente
    const newWindow = window.open('', '_blank');
    if (!newWindow) {
        alert('Permita pop-ups no navegador para visualizar o PDF.');
        return;
    }
    try {
        const response = await api.get(
            //'/api/pdf/generico/' + fileName + '/fita/' + id,
            '/api/pdf/generico/' + fileName + '/' + id,
            {
                responseType: 'blob', // Para lidar com arquivos binários
            }
        );

        // Verificar se o conteúdo do blob é um PDF válido
        if (response.headers['content-type'] !== 'application/pdf') {
            newWindow.close();
            alert('O arquivo carregado não é um PDF válido.');
            return;
        }

        // Criar uma URL para o PDF
        const pdfBlob = new Blob([response.data], {
            type: 'application/pdf',
        });
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Redirecionar a nova aba para a URL do PDF
        newWindow.location.href = pdfUrl;
    } catch (error) {
        newWindow.close(); // Fechar a aba se algo der errado
        console.error('Erro ao carregar o PDF:', error);
    }
};

export const VoiceCapture = () => {
    const [transcript, setTranscript] = useState(''); // Acumula todas as frases
    const [currentSentence, setCurrentSentence] = useState(''); // Texto atual sendo reconhecido
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const [texto, setTexto] = useState('');

    useEffect(() => {
        setTexto(currentSentence);
        console.log(texto);
    }, [currentSentence]);
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        return <p>Seu navegador não suporta a API de reconhecimento de voz.</p>;
    }

    // Configura o reconhecimento de voz
    const setupRecognition = () => {
        const newRecognition = new SpeechRecognition();
        newRecognition.lang = 'pt-PT'; // Configura o idioma
        newRecognition.interimResults = true; // Habilita resultados intermediários
        newRecognition.continuous = true; // Permite captura contínua de áudio

        newRecognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            // Processa os resultados
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            // Atualiza o texto final e intermediário
            setCurrentSentence(finalTranscript + interimTranscript);
        };
        newRecognition.onerror = (event) => {
            console.error('Erro no reconhecimento de voz:', event.error);
            stopListening(); // Para em caso de erro
        };

        newRecognition.onend = () => {
            setIsListening(false); // Muda o estado quando a gravação termina
            // Adiciona a frase final ao histórico
            if (currentSentence.trim()) {
                setTranscript(
                    (prevTranscript) => prevTranscript + currentSentence + '\n'
                );
                setCurrentSentence(''); // Limpa a frase atual após adicionar ao histórico
            }
        };
        return newRecognition;
    };

    const startListening = () => {
        const recognitionInstance = setupRecognition();
        setRecognition(recognitionInstance);
        recognitionInstance.start();
        setIsListening(true);
    };

    const stopListening = () => {
        if (recognition) {
            recognition.stop();
            setIsListening(false);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Captura de Voz</h1>
            <div>
                <button onClick={startListening} disabled={isListening}>
                    Iniciar Gravação
                </button>
                <button onClick={stopListening} disabled={!isListening}>
                    Parar Gravação
                </button>
            </div>
            <textarea
                value={transcript + currentSentence}
                onChange={(e) => setTranscript(e.target.value)}
                rows={10}
                cols={50}
                style={{ marginTop: '20px' }}
            />
        </div>
    );
};

export const InputArtigo = (props) => {
    const [value, setValue] = useState('');
    const options = props.options;

    return (
        <AutoComplete
            style={{
                width: 180,
            }}
            options={options}
            placeholder="Dig. as Inic. do fármaco"
            filterOption={(inputValue, option) =>
                option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !==
                -1
            }
            value={value}
            onChange={(value) => {
                setValue(value);
                props.updateItem(props.id, value);
            }}
        />
    );
};

export const ViaAdministracao = (props) => {
    let options = [
        {
            value: 'Oral',
            label: 'Oral',
        },
        {
            value: 'Sublingual',
            label: 'Sublingual',
        },
        {
            value: 'Retal',
            label: 'Retal',
        },
        {
            value: 'Parenteral-Intravenosa',
            label: 'Parenteral-Intravenosa',
        },
        {
            value: 'Parenteral-Intramuscular',
            label: 'Parenteral-Intramuscular',
        },
        {
            value: 'Parenteral-Subcutânea',
            label: 'Parenteral-Subcutânea',
        },
        {
            value: 'Parenteral-Intradérmica',
            label: 'Parenteral-Intradérmica',
        },
        {
            value: 'Transdérmica',
            label: 'Transdérmica',
        },
        {
            value: 'Inalatória',
            label: 'Inalatória',
        },
        {
            value: 'Intratecal',
            label: 'Intratecal',
        },
        {
            value: 'Vaginal',
            label: 'Vaginal',
        },
        {
            value: 'Nasal',
            label: 'Nasal',
        },
    ];

    return (
        <Select
            showSearch
            placeholder="Seleccione a via"
            style={{ width: 200 }}
            filterOption={(input, option) =>
                (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
            }
            options={options}
            onChange={(value) => {
                props.updateViaAdministracao(props.id, value);
            }}
        />
    );
};

export const Dosagem = (props) => {
    return (
        <Input
            style={{ width: 100 }}
            placeholder="Dig. a dosagem"
            onChange={(e) => {
                props.updateDosagem(props.id, e.target.value);
            }}
        />
    );
};

export const Quantidade = (props) => {
    return (
        <Input
            style={{ width: 50 }}
            placeholder="Dig. a Qtd."
            onChange={(e) => props.updateQtd(props.id, e.target.value)}
        />
    );
};

export const Frequencia = (props) => {
    let options = [
        {
            value: 'Uso único – Apenas uma vez',
            label: 'Uso único – Apenas uma vez',
        },
        {
            value: 'A cada 12 horas (2 vezes ao dia)',
            label: 'A cada 12 horas (2 vezes ao dia)',
        },
        {
            value: 'A cada 8 horas (3 vezes ao dia)',
            label: 'A cada 8 horas (3 vezes ao dia)',
        },
        {
            value: 'A cada 6 horas (4 vezes ao dia)',
            label: 'A cada 6 horas (4 vezes ao dia)',
        },
        {
            value: 'Diário (1 vez ao dia)',
            label: 'Diário (1 vez ao dia)',
        },
        {
            value: 'Semanalmente',
            label: 'Mensalmente',
        },
        {
            value: 'SOS (Se necessário)',
            label: 'SOS (Se necessário)',
        },
    ];

    return (
        <Select
            showSearch
            placeholder="Seleccione a freq."
            style={{ width: 270 }}
            filterOption={(input, option) =>
                (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
            }
            options={options}
            onChange={(value) => {
                props.updateFrequencia(props.id, value);
            }}
        />
    );
};

export const profissaoFONTE = [
    {
        id: 1,
        value: 'Profissao 1',
    },
    {
        id: 2,
        value: 'Profissao 2',
    },
    {
        id: 3,
        value: 'Profissao 3',
    },
];

export const habiliatacaLiterariaFONTE = [
    {
        id: 1,
        value: 'Literaria 1',
    },
    {
        id: 2,
        value: 'Literaria 2',
    },
    {
        id: 3,
        value: 'Literaria 3',
    },
];

export const estadoCivilFONTE = [
    {
        id: 1,
        value: 'Soltero(a)',
    },
    {
        id: 2,
        value: 'Casado(a)',
    },
    {
        id: 3,
        value: 'Divorciado(a)',
    },
    {
        id: 4,
        value: 'Viuvo(a)',
    },
];

export const ModalTriagem = ({
    estado,
    inscricaoId,
    usuarioId = 1,
    onCancel,
    exibirManchester = false,
    exibirEncaminhamento = false,
}) => {
    const [pressaoArterialS, setPressaoArterialS] = useState(120);
    const [pressaoArterialD, setPressaoArterialD] = useState(80);
    const [temperatura, setTemperatura] = useState(37);
    const [peso, setPeso] = useState(0);
    const [pulso, setPulso] = useState(0);
    const [so, setSo] = useState();
    const [respiracao, setRespiracao] = useState();
    const [dor, setDor] = useState();
    const [encaminhamento, setEncaminhamento] = useState('CONSULTORIO');

    const marks = {
        0: '0°C',
        37: '37°C',
        100: {
            style: { color: '#f50' },
            label: <strong>100°C</strong>,
        },
    };
    const sliderStyle = { width: 250 };

    // Ajuste proporcional dinâmico
    const modalWidth = exibirManchester ? 1020 : 500;
    const cardWidth = exibirManchester ? '50%' : '100%';

    // Refs para os campos
    const pressaoArterialSRef = useRef();
    const pressaoArterialDRef = useRef();
    const temperaturaRef = useRef();
    const pesoRef = useRef();
    const pulsoRef = useRef();
    const soRef = useRef();
    const respiracaoRef = useRef();
    const dorRef = useRef();

    const campoPressaoArterial = 'PRESSAO_ARTERIAL';
    const campoFrequenciaCardiaca = 'FREQUENCIA_CARDIACA';
    const campoTemperatura = 'TEMPERATURA';
    const campoFrequenciaRespiratoria = 'FREQUENCIA_RESPIRATORIA';
    const campoSaturacaiOxigenio = 'SATURACAO_OXIGENIO';
    const campoNivelConsciencia = 'NIVEL_CONSCIENCIA';
    const campoDor = 'DOR';
    const campoPulso = 'PULSO';

    const salvarTriagem = async () => {
        // Validação dos campos obrigatórios e foco
        if (!pressaoArterialS) {
            toast.error('Preencha a Pressão Arterial Sistólica!', {
                autoClose: 2000,
            });
            pressaoArterialSRef.current && pressaoArterialSRef.current.focus();
            return;
        }
        if (!pressaoArterialD) {
            toast.error('Preencha a Pressão Arterial Diastólica!', {
                autoClose: 2000,
            });
            pressaoArterialDRef.current && pressaoArterialDRef.current.focus();
            return;
        }
        if (!temperatura) {
            toast.error('Preencha a Temperatura!', { autoClose: 2000 });
            temperaturaRef.current && temperaturaRef.current.focus();
            return;
        }
        if (!peso) {
            toast.error('Preencha o Peso!', { autoClose: 2000 });
            pesoRef.current && pesoRef.current.focus();
            return;
        }
        if (!pulso) {
            toast.error('Preencha o Pulso!', { autoClose: 2000 });
            pulsoRef.current && pulsoRef.current.focus();
            return;
        }
        if (!so) {
            toast.error('Preencha a Saturação O₂!', { autoClose: 2000 });
            soRef.current && soRef.current.focus();
            return;
        }
        if (!respiracao) {
            toast.error('Preencha a Respiração!', { autoClose: 2000 });
            respiracaoRef.current && respiracaoRef.current.focus();
            return;
        }
        if (dor === undefined || dor === null) {
            toast.error('Preencha o campo Dor!', { autoClose: 2000 });
            dorRef.current && dorRef.current.focus();
            return;
        }

        // Validação de intervalos (exemplo)
        if (
            pressaoArterialS < 1 ||
            pressaoArterialS > 220 ||
            pressaoArterialD < 1 ||
            pressaoArterialD > 220 ||
            temperatura < 1 ||
            temperatura > 100 ||
            peso < 1 ||
            peso > 220 ||
            pulso < 1 ||
            pulso > 220 ||
            so < 1 ||
            so > 100 ||
            respiracao < 1 ||
            respiracao > 60 ||
            dor < 0 ||
            dor > 10
        ) {
            toast.error('Algum valor está fora do intervalo permitido!', {
                autoClose: 2000,
            });
            // Foca no primeiro campo fora do intervalo
            if (pressaoArterialS < 1 || pressaoArterialS > 220) {
                pressaoArterialSRef.current &&
                    pressaoArterialSRef.current.focus();
            } else if (pressaoArterialD < 1 || pressaoArterialD > 220) {
                pressaoArterialDRef.current &&
                    pressaoArterialDRef.current.focus();
            } else if (temperatura < 1 || temperatura > 100) {
                temperaturaRef.current && temperaturaRef.current.focus();
            } else if (peso < 1 || peso > 220) {
                pesoRef.current && pesoRef.current.focus();
            } else if (pulso < 1 || pulso > 220) {
                pulsoRef.current && pulsoRef.current.focus();
            } else if (so < 1 || so > 100) {
                soRef.current && soRef.current.focus();
            } else if (respiracao < 1 || respiracao > 60) {
                respiracaoRef.current && respiracaoRef.current.focus();
            } else if (dor < 0 || dor > 10) {
                dorRef.current && dorRef.current.focus();
            }
            return;
        }

        try {
            const triagem = {
                dataCriacao: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                inscricaoId: inscricaoId,
                usuarioId: usuarioId,
            };

            console.log('Salvando triagem:', triagem);
            const r = await api.post('triagem/add', triagem);
            const id = r.data.id;
            const _linhasTriagem = _getLinhasTriagem(id);
            await api.post('linhatriagem/add/all', _linhasTriagem);
            console.log('Triagem e linhas registradas com sucesso');

            if (exibirEncaminhamento) {
                await encaminhar();
            }

            onCancel();

            toast.success('Paciente Triado com sucesso!', {
                autoClose: 2000,
            });
        } catch (e) {
            console.error('Erro ao registrar triagem ou linhas:', e);
            toast.success('Falha ao triar o paciente!', {
                autoClose: 2000,
            });
            // Aqui pode exibir mensagem de erro ao usuário
        }
    };

    function _getLinhasTriagem(triagemId) {
        let _linhas = [];
        _linhas.push(
            getItem(
                triagemId,
                campoPressaoArterial,
                pressaoArterialS + '/' + pressaoArterialD,
                'mmHg'
            )
        );
        // _linhas.push(getItem(triagemId, campoPeso, peso, 'Kg'));
        _linhas.push(getItem(triagemId, campoTemperatura, temperatura, '°C'));
        _linhas.push(getItem(triagemId, campoPulso, pulso, 'bpm'));
        _linhas.push(getItem(triagemId, campoSaturacaiOxigenio, so, '%'));
        _linhas.push(
            getItem(triagemId, campoFrequenciaRespiratoria, respiracao, 'ipm')
        );
        _linhas.push(getItem(triagemId, campoDor, dor, 'Un.'));
        return _linhas;
    }

    function getItem(id, campo, valor, unidade) {
        let _item = {
            campo: campo,
            valor: valor,
            unidade: unidade,
            triagemId: id,
        };
        return _item;
    }

    const encaminhar = async () => {
        try {
            await api.put(
                'inscricao/edit/' + inscricaoId + '/TRIADO/' + encaminhamento
            );
            console.log('Encaminhamento efectuado com sucesso');
            viewPdfPacienteFita('paciente_fita', inscricaoId);
        } catch (e) {
            console.log('Falha ao efectuar o encaminhamento', e);
        }
    };

    return (
        <Modal
            title="Triagem"
            open={estado}
            onOk={salvarTriagem}
            okText="Actualizar"
            onCancel={onCancel}
            width={modalWidth}
            style={{
                maxWidth: modalWidth,
                minWidth: modalWidth,
                padding: 0,
            }}
        >
            <Flex gap="large" wrap={false} align="stretch">
                <Card
                    bordered
                    title="Sinais Vitais"
                    style={{
                        width: cardWidth,
                        marginBottom: 10,
                        marginRight: 0,
                        boxSizing: 'border-box',
                    }}
                >
                    <Flex gap="middle" vertical>
                        {/* Pressão Arterial */}
                        <div>
                            <label>
                                Pressão Arterial{' '}
                                <span
                                    style={{ fontWeight: 'bold', fontSize: 20 }}
                                >
                                    {pressaoArterialS}/{pressaoArterialD}
                                </span>{' '}
                                mmHg
                            </label>
                            <Row gutter={8}>
                                <Col span={12}>
                                    <span>Sistólica</span>
                                    <Slider
                                        min={1}
                                        max={220}
                                        onChange={setPressaoArterialS}
                                        value={pressaoArterialS}
                                    />
                                </Col>
                                <Col span={12}>
                                    <span>Diastólica</span>
                                    <Slider
                                        min={1}
                                        max={220}
                                        onChange={setPressaoArterialD}
                                        value={pressaoArterialD}
                                    />
                                </Col>
                            </Row>
                        </div>
                        {/* Temperatura */}
                        <div>
                            <label>
                                Temperatura{' '}
                                <span
                                    style={{ fontWeight: 'bold', fontSize: 20 }}
                                >
                                    {temperatura}
                                </span>{' '}
                                °C
                            </label>
                            <Row gutter={8}>
                                <Col span={18}>
                                    <Slider
                                        marks={marks}
                                        value={temperatura}
                                        onChange={setTemperatura}
                                        min={1}
                                        max={100}
                                        style={sliderStyle}
                                    />
                                </Col>
                                <Col span={6}>
                                    <InputNumber
                                        min={1}
                                        max={100}
                                        value={temperatura}
                                        onChange={setTemperatura}
                                    />
                                </Col>
                            </Row>
                        </div>
                        {/* Peso */}
                        <div>
                            <label>
                                Peso{' '}
                                <span
                                    style={{ fontWeight: 'bold', fontSize: 20 }}
                                >
                                    {peso}
                                </span>{' '}
                                Kg
                            </label>
                            <Row gutter={8}>
                                <Col span={18}>
                                    <Slider
                                        min={1}
                                        max={220}
                                        onChange={setPeso}
                                        value={peso}
                                        style={sliderStyle}
                                    />
                                </Col>
                                <Col span={6}>
                                    <InputNumber
                                        min={1}
                                        max={220}
                                        value={peso}
                                        onChange={setPeso}
                                    />
                                </Col>
                            </Row>
                        </div>
                        {/* Outros sinais */}
                        <Row gutter={16}>
                            <Col span={12}>
                                <label>Pulso</label>
                                <InputNumber
                                    min={1}
                                    max={220}
                                    value={pulso}
                                    onChange={setPulso}
                                    style={{ width: '100%' }}
                                    ref={pulsoRef}
                                />
                            </Col>
                            <Col span={12}>
                                <label>Saturação O₂ (%)</label>
                                <InputNumber
                                    min={1}
                                    max={100}
                                    value={so}
                                    onChange={setSo}
                                    style={{ width: '100%' }}
                                    ref={soRef}
                                />
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <label>Respiração (ipm)</label>
                                <InputNumber
                                    min={1}
                                    max={60}
                                    value={respiracao}
                                    onChange={setRespiracao}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col span={12}>
                                <label>Dor (0-10)</label>
                                <InputNumber
                                    min={0}
                                    max={10}
                                    value={dor}
                                    onChange={setDor}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                        </Row>
                        {/* Encaminhamento condicional */}
                        {exibirEncaminhamento && (
                            <div>
                                <label
                                    style={{
                                        fontWeight: 'bold',
                                        marginBottom: 10,
                                    }}
                                >
                                    Encaminhamento:
                                </label>
                                <Radio.Group
                                    onChange={(e) =>
                                        setEncaminhamento(e.target.value)
                                    }
                                    value={encaminhamento}
                                >
                                    <Space direction="vertical">
                                        <Radio value="CONSULTORIO">
                                            Consultório
                                        </Radio>
                                        <Radio value="SO">
                                            Sala de Observação
                                        </Radio>
                                        <Radio value="CADEIRA">Cadeira</Radio>
                                    </Space>
                                </Radio.Group>
                            </div>
                        )}
                    </Flex>
                </Card>
                {exibirManchester && (
                    <Card
                        title="Triagem de Manchester"
                        style={{ width: '50%' }}
                    >
                        <TriagemManchester idInscricao={inscricaoId} />
                    </Card>
                )}
            </Flex>
        </Modal>
    );
};

export const ModalFinalizarAtendimento = ({
    estado,
    onCancel,
    onFinalizar,
}) => {
    const _finalizarProcesso = async () => {
        await onFinalizar();
        onCancel();
    };
    return (
        <Modal
            title="Finalizar Atendimento"
            visible={estado}
            okText="Sim"
            onCancel={onCancel}
            onOk={_finalizarProcesso}
        >
            <p>Tem certeza que deseja finalizar o atendimento?</p>
        </Modal>
    );
};
