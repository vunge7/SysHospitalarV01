import React, { useState } from 'react';
import { Button, Modal, Card, Row, Col, Typography, Spin } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/auth';
import { api } from '../service/api';

const { Title, Text } = Typography;

const TrocarFilial = () => {
    const { user, setUser } = React.useContext(AuthContext);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [filiais, setFiliais] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const showModal = async () => {
        setIsModalVisible(true);
        await carregarFiliais();
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const carregarFiliais = async () => {
        try {
            setLoading(true);
            
            // 1. Buscar IDs das filiais que o usuário tem permissão
            const filiaisIdsResponse = await api.get(`/painelpermissoes/usuario/${user?.id}/filiais`);
            
            if (filiaisIdsResponse.data && filiaisIdsResponse.data.length > 0) {
                // 2. Buscar dados completos das filiais
                const filiaisCompletas = [];
                
                for (const filialId of filiaisIdsResponse.data) {
                    try {
                        const filialResponse = await api.get(`/filial/${filialId}`);
                        if (filialResponse.data) {
                            filiaisCompletas.push(filialResponse.data);
                        }
                    } catch (filialErr) {
                        console.error(`Erro ao carregar filial ${filialId}:`, filialErr);
                    }
                }
                
                setFiliais(filiaisCompletas);
            }
        } catch (err) {
            console.error('Erro ao carregar filiais:', err);
        } finally {
            setLoading(false);
        }
    };

    const selecionarFilial = async (filial) => {
        try {
            // Salvar nova filial selecionada
            const userWithNewFilial = {
                ...user,
                filialSelecionada: filial
            };
            
            setUser(userWithNewFilial);
            localStorage.setItem('@sysHospitalarPRO', JSON.stringify(userWithNewFilial));
            
            setIsModalVisible(false);
            
            // Redirecionar para a página inicial da nova filial
            navigate('/admin');
            
        } catch (err) {
            console.error('Erro ao trocar filial:', err);
        }
    };

    return (
        <>
            <Button 
                type="text" 
                icon={<SwapOutlined />} 
                onClick={showModal}
                style={{ color: '#1890ff' }}
            >
                Trocar Filial
            </Button>
            
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <SwapOutlined style={{ marginRight: 8 }} />
                        Trocar Filial
                    </div>
                }
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={800}
            >
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Spin size="large" />
                        <Text style={{ display: 'block', marginTop: 16 }}>
                            Carregando filiais...
                        </Text>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: 24 }}>
                            <Text>
                                Filial atual: <strong>{user?.filialSelecionada?.nome}</strong>
                            </Text>
                        </div>
                        
                        <Row gutter={[16, 16]}>
                            {filiais.map((filial) => (
                                <Col xs={24} sm={12} md={8} key={filial.id}>
                                    <Card
                                        hoverable
                                        style={{ 
                                            cursor: 'pointer',
                                            border: user?.filialSelecionada?.id === filial.id 
                                                ? '2px solid #52c41a' 
                                                : '1px solid #d9d9d9'
                                        }}
                                        onClick={() => selecionarFilial(filial)}
                                    >
                                        <div style={{ textAlign: 'center' }}>
                                            <div 
                                                style={{ 
                                                    fontSize: 32, 
                                                    color: user?.filialSelecionada?.id === filial.id 
                                                        ? '#52c41a' 
                                                        : '#1890ff',
                                                    marginBottom: 12
                                                }} 
                                            >
                                                🏢
                                            </div>
                                            <Title level={5} style={{ marginBottom: 8 }}>
                                                {filial.nome}
                                            </Title>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {filial.endereco}
                                            </Text>
                                            
                                            {user?.filialSelecionada?.id === filial.id && (
                                                <div style={{ 
                                                    marginTop: 8,
                                                    padding: '4px 8px',
                                                    background: '#f6ffed',
                                                    border: '1px solid #b7eb8f',
                                                    borderRadius: 4,
                                                    fontSize: 12,
                                                    color: '#52c41a'
                                                }}>
                                                    Filial Atual
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </>
                )}
            </Modal>
        </>
    );
};

export default TrocarFilial; 