import React, { useEffect, useState, useRef } from 'react';
import { AutoComplete, Select, Input, Modal, Flex, Card, Row, Col, Slider, InputNumber, Radio, Space } from 'antd';
import { toast } from 'react-toastify';
import TriagemManchester from '../TriagemManchester';
import { api } from '../../service/api';
import { format } from 'date-fns';

// === FUNÇÕES DE PDF ===
export const viewPdf = async (fileName, id) => {
    const newWindow = window.open('', '_blank');
    if (!newWindow) {
        alert('Permita pop-ups no navegador para visualizar o PDF.');
        return;
    }
    try {
        const response = await api.get('/api/pdf/' + fileName + '/' + id, {
            responseType: 'blob',
        });

        if (response.headers['content-type'] !== 'application/pdf') {
            newWindow.close();
            alert('O arquivo carregado não é um PDF válido.');
            return;
        }

        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        newWindow.location.href = pdfUrl;
    } catch (error) {
        newWindow.close();
        console.error('Erro ao carregar o PDF:', error);
    }
};

export const viewPdfPacienteFita = async (fileName, id) => {
    const newWindow = window.open('', '_blank');
    if (!newWindow) {
        alert('Permita pop-ups no navegador para visualizar o PDF.');
        return;
    }
    try {
        const response = await api.get('/api/pdf/' + fileName + '/fita/' + id, {
            responseType: 'blob',
        });

        if (response.headers['content-type'] !== 'application/pdf') {
            newWindow.close();
            alert('O arquivo carregado não é um PDF válido.');
            return;
        }

        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        newWindow.location.href = pdfUrl;
    } catch (error) {
        newWindow.close();
        console.error('Erro ao carregar o PDF:', error);
    }
};

export const viewPdfGenerico = async (fileName, id) => {
    const newWindow = window.open('', '_blank');
    if (!newWindow) {
        alert('Permita pop-ups no navegador para visualizar o PDF.');
        return;
    }
    try {
        const response = await api.get('/api/pdf/generico/' + fileName + '/' + id, {
            responseType: 'blob',
        });

        if (response.headers['content-type'] !== 'application/pdf') {
            newWindow.close();
            alert('O arquivo carregado não é um PDF válido.');
            return;
        }

        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        newWindow.location.href = pdfUrl;
    } catch (error) {
        newWindow.close();
        console.error('Erro ao carregar o PDF:', error);
    }
};

// === VOICE CAPTURE ===
export const VoiceCapture = () => {
    const [transcript, setTranscript] = useState('');
    const [currentSentence, setCurrentSentence] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {}, [currentSentence]);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        return <p>Seu navegador não suporta a API de reconhecimento de voz.</p>;
    }

    const setupRecognition = () => {
        const newRecognition = new SpeechRecognition();
        newRecognition.lang = 'pt-PT';
        newRecognition.interimResults = true;
        newRecognition.continuous = true;

        newRecognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            setCurrentSentence(finalTranscript + interimTranscript);
        };

        newRecognition.onerror = () => stopListening();
        newRecognition.onend = () => {
            setIsListening(false);
            if (currentSentence.trim()) {
                setTranscript(prev => prev + currentSentence + '\n');
                setCurrentSentence('');
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

// === INPUTS ===
export const InputArtigo = (props) => {
    const [value, setValue] = useState('');
    const options = props.options;

    return (
        <AutoComplete
            style={{ width: 180 }}
            options={options}
            placeholder="Dig. as Inic. do fármaco"
            filterOption={(inputValue, option) =>
                option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
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
    const options = [
        { value: 'Oral', label: 'Oral' },
        { value: 'Sublingual', label: 'Sublingual' },
        { value: 'Retal', label: 'Retal' },
        { value: 'Parenteral-Intravenosa', label: 'Parenteral-Intravenosa' },
        { value: 'Parenteral-Intramuscular', label: 'Parenteral-Intramuscular' },
        { value: 'Parenteral-Subcutânea', label: 'Parenteral-Subcutânea' },
        { value: 'Parenteral-Intradérmica', label: 'Parenteral-Intradérmica' },
        { value: 'Transdérmica', label: 'Transdérmica' },
        { value: 'Inalatória', label: 'Inalatória' },
        { value: 'Intratecal', label: 'Intratecal' },
        { value: 'Vaginal', label: 'Vaginal' },
        { value: 'Nasal', label: 'Nasal' },
    ];

    return (
        <Select
            showSearch
            placeholder="Seleccione a via"
            style={{ width: 200 }}
            filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={options}
            onChange={(value) => props.updateViaAdministracao(props.id, value)}
        />
    );
};

export const Dosagem = (props) => (
    <Input
        style={{ width: 100 }}
        placeholder="Dig. a dosagem"
        onChange={(e) => props.updateDosagem(props.id, e.target.value)}
    />
);

export const Quantidade = (props) => (
    <Input
        style={{ width: 50 }}
        placeholder="Dig. a Qtd."
        onChange={(e) => props.updateQtd(props.id, e.target.value)}
    />
);

export const Frequencia = (props) => {
    const options = [
        { value: 'Uso único – Apenas uma vez', label: 'Uso único – Apenas uma vez' },
        { value: 'A cada 12 horas (2 vezes ao dia)', label: 'A cada 12 horas (2 vezes ao dia)' },
        { value: 'A cada 8 horas (3 vezes ao dia)', label: 'A cada 8 horas (3 vezes ao dia)' },
        { value: 'A cada 6 horas (4 vezes ao dia)', label: 'A cada 6 horas (4 vezes ao dia)' },
        { value: 'Diário (1 vez ao dia)', label: 'Diário (1 vez ao dia)' },
        { value: 'Semanalmente', label: 'Mensalmente' },
        { value: 'SOS (Se necessário)', label: 'SOS (Se necessário)' },
    ];

    return (
        <Select
            showSearch
            placeholder="Seleccione a freq."
            style={{ width: 270 }}
            filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={options}
            onChange={(value) => props.updateFrequencia(props.id, value)}
        />
    );
};

// === API DE PROFISSÕES (HOOK) ===
export const useProfissoes = () => {
    const [profissoes, setProfissoes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fallback = [
        { id: 1, value: 'Médico' },
        { id: 2, value: 'Enfermeiro' },
        { id: 3, value: 'Técnico de Enfermagem' },
    ];

    useEffect(() => {
        api.get('/professions')
            .then(res => {
                setProfissoes(Array.isArray(res.data) ? res.data : fallback);
            })
            .catch(() => {
                setProfissoes(fallback);
            })
            .finally(() => setLoading(false));
    }, []);

    return { profissoes, loading };
};

// === DEMAIS FONTES ===
export const habiliatacaLiterariaFONTE = [
    { id: 1, value: 'Nenhuma' },
    { id: 2, value: 'Básico' },
    { id: 3, value: 'Médio' },
    { id: 4, value: 'Superior' },
];

export const estadoCivilFONTE = [
    { id: 1, value: 'Solteiro(a)' },
    { id: 2, value: 'Casado(a)' },
    { id: 3, value: 'Divorciado(a)' },
    { id: 4, value: 'Viúvo(a)' },
];

// === MODAL TRIAGEM (CORRIGIDO) ===
export const ModalTriagem = ({
    estado,
    inscricaoId,
    usuarioId = 1,
    onCancel,
    exibirManchester = false,
    exibirEncaminhamento = false,
    carregarDados, // Corrigido: "carrgar" → "carregar"
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

    const marks = { 0: '0°C', 37: '37°C', 100: { style: { color: '#f50' }, label: <strong>100°C</strong> } };
    const sliderStyle = { width: 250 };
    const modalWidth = exibirManchester ? 1020 : 500;
    const cardWidth = exibirManchester ? '50%' : '100%';

    // === REFS CORRIGIDOS ===
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

    // === FUNÇÃO getItem ADICIONADA ===
    const getItem = (id, campo, valor, unidade) => ({ campo, valor, unidade, triagemId: id });

    const salvarTriagem = async () => {
        if (!pressaoArterialS) { toast.error('Preencha a Pressão Arterial Sistólica!'); pressaoArterialSRef.current?.focus(); return; }
        if (!pressaoArterialD) { toast.error('Preencha a Pressão Arterial Diastólica!'); pressaoArterialDRef.current?.focus(); return; }
        if (!temperatura) { toast.error('Preencha a Temperatura!'); temperaturaRef.current?.focus(); return; }
        if (!peso) { toast.error('Preencha o Peso!'); pesoRef.current?.focus(); return; }
        if (!pulso) { toast.error('Preencha o Pulso!'); pulsoRef.current?.focus(); return; }
        if (!so) { toast.error('Preencha a Saturação O₂!'); soRef.current?.focus(); return; }
        if (!respiracao) { toast.error('Preencha a Respiração!'); respiracaoRef.current?.focus(); return; }
        if (dor === undefined || dor === null) { toast.error('Preencha o campo Dor!'); dorRef.current?.focus(); return; }

        if (
            pressaoArterialS < 1 || pressaoArterialS > 220 ||
            pressaoArterialD < 1 || pressaoArterialD > 220 ||
            temperatura < 1 || temperatura > 100 ||
            peso < 1 || peso > 220 ||
            pulso < 1 || pulso > 220 ||
            so < 1 || so > 100 ||
            respiracao < 1 || respiracao > 60 ||
            dor < 0 || dor > 10
        ) {
            toast.error('Algum valor está fora do intervalo permitido!');
            return;
        }

        try {
            const triagem = {
                dataCriacao: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                inscricaoId,
                usuarioId,
            };

            const r = await api.post('triagem/add', triagem);
            const id = r.data.id;
            const _linhasTriagem = [
                getItem(id, campoPressaoArterial, `${pressaoArterialS}/${pressaoArterialD}`, 'mmHg'),
                getItem(id, campoTemperatura, temperatura, '°C'),
                getItem(id, campoPulso, pulso, 'bpm'),
                getItem(id, campoSaturacaiOxigenio, so, '%'),
                getItem(id, campoFrequenciaRespiratoria, respiracao, 'ipm'),
                getItem(id, campoDor, dor, 'Un.'),
            ];
            await api.post('linhatriagem/add/all', _linhasTriagem);

            if (exibirEncaminhamento) await encaminhar();

            onCancel();
            toast.success('Paciente Triado com sucesso!');
            carregarDados?.(); // Corrigido: agora usa a função correta
        } catch (e) {
            console.error('Erro ao registrar triagem:', e);
            toast.error('Falha ao triar o paciente!');
        }
    };

    const encaminhar = async () => {
        try {
            await api.put(`inscricao/edit/${inscricaoId}/TRIADO/${encaminhamento}`);
            viewPdfPacienteFita('paciente_fita', inscricaoId);
        } catch (e) {
            console.log('Falha ao encaminhar:', e);
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
            style={{ maxWidth: modalWidth, minWidth: modalWidth, padding: 0 }}
        >
            <Flex gap="large" wrap={false} align="stretch">
                <Card bordered title="Sinais Vitais" style={{ width: cardWidth, marginBottom: 10, marginRight: 0, boxSizing: 'border-box' }}>
                    <Flex gap="middle" vertical>
                        <div>
                            <label>Pressão Arterial <span style={{ fontWeight: 'bold', fontSize: 20 }}>{pressaoArterialS}/{pressaoArterialD}</span> mmHg</label>
                            <Row gutter={8}>
                                <Col span={12}><span>Sistólica</span><Slider ref={pressaoArterialSRef} min={1} max={220} onChange={setPressaoArterialS} value={pressaoArterialS} /></Col>
                                <Col span={12}><span>Diastólica</span><Slider ref={pressaoArterialDRef} min={1} max={220} onChange={setPressaoArterialD} value={pressaoArterialD} /></Col>
                            </Row>
                        </div>
                        <div>
                            <label>Temperatura <span style={{ fontWeight: 'bold', fontSize: 20 }}>{temperatura}</span> °C</label>
                            <Row gutter={8}>
                                <Col span={18}><Slider ref={temperaturaRef} marks={marks} value={temperatura} onChange={setTemperatura} min={1} max={100} style={sliderStyle} /></Col>
                                <Col span={6}><InputNumber min={1} max={100} value={temperatura} onChange={setTemperatura} /></Col>
                            </Row>
                        </div>
                        <div>
                            <label>Peso <span style={{ fontWeight: 'bold', fontSize: 20 }}>{peso}</span> Kg</label>
                            <Row gutter={8}>
                                <Col span={18}><Slider ref={pesoRef} min={1} max={220} onChange={setPeso} value={peso} style={sliderStyle} /></Col>
                                <Col span={6}><InputNumber min={1} max={220} value={peso} onChange={setPeso} /></Col>
                            </Row>
                        </div>
                        <Row gutter={16}>
                            <Col span={12}><label>Pulso</label><InputNumber ref={pulsoRef} min={1} max={220} value={pulso} onChange={setPulso} style={{ width: '100%' }} /></Col>
                            <Col span={12}><label>Saturação O₂ (%)</label><InputNumber ref={soRef} min={1} max={100} value={so} onChange={setSo} style={{ width: '100%' }} /></Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}><label>Respiração (ipm)</label><InputNumber ref={respiracaoRef} min={1} max={60} value={respiracao} onChange={setRespiracao} style={{ width: '100%' }} /></Col>
                            <Col span={12}><label>Dor (0-10)</label><InputNumber ref={dorRef} min={0} max={10} value={dor} onChange={setDor} style={{ width: '100%' }} /></Col>
                        </Row>
                        {exibirEncaminhamento && (
                            <div>
                                <label style={{ fontWeight: 'bold', marginBottom: 10 }}>Encaminhamento:</label>
                                <Radio.Group onChange={(e) => setEncaminhamento(e.target.value)} value={encaminhamento}>
                                    <Space direction="vertical">
                                        <Radio value="CONSULTORIO">Consultório</Radio>
                                        <Radio value="SO">Sala de Observação</Radio>
                                        <Radio value="CADEIRA">Cadeira</Radio>
                                    </Space>
                                </Radio.Group>
                            </div>
                        )}
                    </Flex>
                </Card>
                {exibirManchester && (
                    <Card title="Triagem de Manchester" style={{ width: '50%' }}>
                        <TriagemManchester idInscricao={inscricaoId} />
                    </Card>
                )}
            </Flex>
        </Modal>
    );
};

// === MODAL FINALIZAR ===
export const ModalFinalizarAtendimento = ({ estado, onCancel, onFinalizar }) => {
    const _finalizarProcesso = async () => {
        await onFinalizar();
        onCancel();
    };

    return (
        <Modal
            title="Finalizar Atendimento"
            open={estado}
            okText="Sim"
            onCancel={onCancel}
            onOk={_finalizarProcesso}
        >
            <p>Tem certeza que deseja finalizar o atendimento?</p>
        </Modal>
    );
};