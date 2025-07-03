import React, { useEffect, useState } from 'react';
import { AutoComplete, Select, Input } from 'antd';

import { api } from '../../service/api';
//import { gerarDocumento } from '../../Reports/FacturaReport';

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
