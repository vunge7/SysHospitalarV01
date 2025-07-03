import React, { useState, useEffect } from 'react';


import { api } from '../../service/api'; // Ajuste o caminho conforme necessário    


export default function FormularioQRCode() {
    const [formData, setFormData] = useState({
        id:'',
        nome: '',
        email: '',
        telefone: '',
    });

    useEffect(() => {
        const fetchLastQr = async () => {
            try {
                const response = await api.get('api/qr-data');
                if (response.data) {
                    setFormData({
                        id: response.data.id || '',
                        nome: response.data.nome || '',
                        email: response.data.email || '',
                        telefone: response.data.telefone || '',
                    });
                }
            } catch (error) {
                console.log(`Erro ao buscar dados do QR Code: ${error}`);
                // Se não houver dado, apenas ignora
            }
        };
        fetchLastQr();
        const interval = setInterval(fetchLastQr, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
            <h2>Formulário QR Code</h2>
            <form>
                <div>
                    <label>Id:</label>
                    <input
                        type="text"
                        value={formData.id}
                        onChange={(e) =>
                            setFormData({ ...formData, id: e.target.value })
                        }
                    />
                </div>
                <div>
                    <label>Nome:</label>
                    <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) =>
                            setFormData({ ...formData, nome: e.target.value })
                        }
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                    />
                </div>
                <div>
                    <label>Telefone:</label>
                    <input
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                telefone: e.target.value,
                            })
                        }
                    />
                </div>
            </form>
        </div>
    );
}
