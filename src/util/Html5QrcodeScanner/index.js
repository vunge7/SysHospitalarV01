import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button, Typography, Box, Paper } from '@mui/material';
import axios from 'axios';
//openssl pkcs12 -export -out C:\certificados\local-ssl.p12 -inkey C:\certificados\local-ssl.key -in C:\certificados\local-ssl.crt -name meucertificado

import { api } from '../../service/api'; // Ajuste o caminho conforme necessário  

export default function QrCodeScannerPage() {
  const [result, setResult] = useState('');
  const [enviado, setEnviado] = useState(false);
  useEffect(() => {
    // Inicializa apenas o scanner de QR Code
    const scanner = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(async (decodedText) => {
      console.log('QR Code lido:', decodedText);
      setResult(decodedText);
      // Emite um som ao detectar QR Code
      try {
        const beep = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
        beep.play();
      } catch (e) {
        // Se não conseguir tocar o som, apenas ignora
      }
      try {
        await api.post('api/qr-data', {
          id: decodedText,
          nome: '',
          email: '',
          telefone: ''
        });
        setEnviado(true);
      } catch (error) {
        console.error(error);
        alert('Erro ao enviar para o servidor!');
      }
    });

    return () => {
      scanner.clear().catch((error) => console.error('Erro ao limpar scanner', error));
    };
  }, []);


  // Função de envio manual removida, pois agora o envio é automático ao ler o QR

  return (
    <Box sx={{ p: 2, maxWidth: 400, margin: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Scanner de QR Code
      </Typography>

      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <div id="reader" style={{ width: '100%' }}></div>
      </Paper>

      <Typography variant="subtitle1">
        Resultado lido:
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {result || 'Nenhum resultado ainda.'}
      </Typography>

      {/* Botão removido, envio agora é automático ao ler o QR Code */}
    </Box>
  );
}
