import React, { useState, useEffect } from 'react';

function TextToSpeech() {
    const [inputText, setInputText] = useState('');
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [message, setMessage] = useState('Aguardando a hora...');

    useEffect(() => {
        const targetHour = 21;
        const targetMinute = 35;

        const loadVoices = () => {
            const availableVoices = speechSynthesis.getVoices();
            //console.log(availableVoices);
            setVoices(availableVoices);
            setSelectedVoice(availableVoices[0]); // Selecionar a primeira voz por padrão
        };
        speechSynthesis.onvoiceschanged = loadVoices;

        // Função para calcular o tempo até a hora alvo
        const calculateTimeUntilTarget = () => {
            const now = new Date();
            const targetTime = new Date();
            targetTime.setHours(targetHour, targetMinute, 0, 0);

            const timeDifference = targetTime.getTime() - now.getTime();
            return timeDifference;
        };

        // Calcula o tempo restante até a hora alvo
        const timeUntilTarget = calculateTimeUntilTarget();

        if (timeUntilTarget > 0) {
            // Define um timeout para disparar o evento quando atingir o horário
            const timer = setTimeout(() => {
                setMessage('A hora chegou! Evento disparado!');
                handleSpeak();
            }, timeUntilTarget);
            // Limpa o timeout quando o componente for desmontado
            return () => clearTimeout(timer);
        } else {
            // Se a hora já tiver passado, define a mensagem como "Hora já passou"
            setMessage('A hora já passou.');
        }
    }, []);

    const handleSpeak = () => {
        console.log('cheguei aqui. no listen');

        const utterance = new SpeechSynthesisUtterance(inputText);
        utterance.voice = selectedVoice;
        speechSynthesis.speak(utterance);
    };

    return (
        <div>
            <span>{message}</span>
            <h1>Conversor de Texto para Áudio</h1>
            <textarea
                rows="4"
                cols="50"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Digite o texto aqui"
            />
            <br />
            <label>Escolha uma voz: </label>
            <select
                onChange={(e) =>
                    setSelectedVoice(voices[e.target.selectedIndex])
                }
            >
                {voices.map((voice, index) => (
                    <option key={index} value={voice.name}>
                        {voice.name} ({voice.lang})
                    </option>
                ))}
            </select>
            <br />
            <button onClick={handleSpeak}>Falar</button>
        </div>
    );
}

export default TextToSpeech;
