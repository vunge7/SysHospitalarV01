import React, { useRef, useState, useEffect } from 'react';
import { Input, Button, Space } from 'antd';
import { AudioOutlined, SoundOutlined, StopOutlined } from '@ant-design/icons';
const { TextArea } = Input;

function TextToSpeech({ inputText, setInputText }) {
    const recognitionRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const textAreaRef = useRef(null); // Adicione este ref

    // Iniciar reconhecimento de voz
    const handleStartRecognition = () => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Seu navegador não suporta reconhecimento de voz.');
            return;
        }
        // Foca no campo de texto ao iniciar
        if (textAreaRef.current) {
            // Para Ant Design TextArea, acesse o textarea nativo assim:
            const nativeTextArea =
                textAreaRef.current.resizableTextArea?.textArea;
            if (nativeTextArea) {
                nativeTextArea.focus();
                const length = nativeTextArea.value.length;
                nativeTextArea.setSelectionRange(length, length);
            }
        }
        // Limpa o texto ao iniciar nova gravação
        //setInputText('');
        if (!recognitionRef.current) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.lang = 'pt-PT';
            recognitionRef.current.continuous = true; // Captura contínua
            recognitionRef.current.interimResults = false;
            recognitionRef.current.onresult = (event) => {
                const lastResultIndex = event.results.length - 1;
                let transcript = event.results[lastResultIndex][0].transcript;

                // Remove ponto final automático no fim da frase (com ou sem espaço)
                transcript = transcript.replace(/[.。]\s*$/, '');

                setInputText((prev) =>
                    prev ? prev + ' ' + transcript : transcript
                );
            };
            recognitionRef.current.onerror = (event) => {
                alert('Erro no reconhecimento de voz: ' + event.error);
                setIsRecording(false);
            };
            recognitionRef.current.onend = () => {
                setIsRecording(false);
            };
        }
        recognitionRef.current.start();
        setIsRecording(true);
    };

    // Parar reconhecimento de voz
    const handleStopRecognition = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
    };

    // Falar o texto digitado
    const handleSpeak = () => {
        if (!inputText) return;
        const utterance = new window.SpeechSynthesisUtterance(inputText);
        utterance.lang = 'pt-PT';
        window.speechSynthesis.speak(utterance);
    };

    function AudioVisualizer({ isActive }) {
        const [bars, setBars] = useState([10, 20, 15, 25, 18, 22, 12, 17]);

        useEffect(() => {
            if (!isActive) return;
            const interval = setInterval(() => {
                setBars((bars) =>
                    bars.map(() => 10 + Math.round(Math.random() * 20))
                );
            }, 120);
            return () => clearInterval(interval);
        }, [isActive]);

        return (
            <svg
                width="120"
                height="30"
                style={{ display: 'block', margin: '10px auto' }}
            >
                {bars.map((h, i) => (
                    <rect
                        key={i}
                        x={i * 15}
                        y={30 - h}
                        width={10}
                        height={h}
                        rx={2}
                        fill="#1890ff"
                    />
                ))}
            </svg>
        );
    }

    return (
        <div style={{ maxWidth: 500, padding: 5 }}>
            <TextArea
                ref={textAreaRef}
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Digite o texto aqui ou use o microfone"
                style={{ marginBottom: 16 }}
            />
            <div style={{ minHeight: 40, marginBottom: 8 }}>
                {isRecording && <AudioVisualizer isActive={isRecording} />}
            </div>
            <Space>
                <Button
                    type="primary"
                    icon={<AudioOutlined />}
                    onClick={handleStartRecognition}
                    disabled={isRecording}
                >
                    Falar
                </Button>
                <Button
                    icon={<StopOutlined />}
                    onClick={handleStopRecognition}
                    disabled={!isRecording}
                    danger
                >
                    Parar
                </Button>
                <Button
                    icon={<SoundOutlined />}
                    onClick={handleSpeak}
                    disabled={!inputText}
                >
                    Ouvir
                </Button>
            </Space>
        </div>
    );
}

export default TextToSpeech;
