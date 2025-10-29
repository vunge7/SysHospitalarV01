import React, { useContext, useState, useEffect } from 'react';
import { Card, Row, Col, Button, Spin, Alert, Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { AuthContext } from '../../contexts/auth';
import { api } from '../../service/api';
import { useNavigate } from 'react-router-dom';
import { use } from 'react';

const { Title, Text } = Typography;

const SelecionarFilial = () => {
    const {
        user,
        setUser,
        logout,
        filiais,
        permissoes,
        setPermissoes,
        filialSelecionada,
        setFilialSelecionada,
    } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedFilial, setSelectedFilial] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        carregarFiliais();
    }, []);

    const carregarFiliais = async () => {
        try {
            setLoading(true);

            // 1. Buscar IDs das filiais que o usuário tem permissão
        } catch (err) {
            console.error('Erro ao carregar filiais:', err);
            setError('Erro ao carregar filiais. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const selecionarFilial = async (filial) => {
        try {
            setSelectedFilial(filial);

            const permissoesResponse = await api.get(
                `/painelpermissoes/usuario/${user.id}/filial/${filial.id}`
            );
            setPermissoes(permissoesResponse.data || []);

            setFilialSelecionada(filial);
            // Salvar filial selecionada e permissoes no contexto e localStorage
            const userWithFilial = {
                ...user,
                filialSelecionada: filial,
                permissoes: permissoesResponse.data || [],
            };

            setUser(userWithFilial);
            localStorage.setItem(
                '@sysHospitalarPRO',
                JSON.stringify(userWithFilial)
            );

            // Redirecionar para o painel principal baseado no tipo de usuário
            setTimeout(() => {
                switch (user.tipo) {
                    case 'ADMINISTRATIVO':
                        navigate('/admin');
                        break;
                    case 'medico':
                        navigate('/medico/home');
                        break;
                    case 'enfermeiro':
                        navigate('/enf');
                        break;
                    case 'analista':
                        navigate('/admin');
                        break;
                    default:
                        navigate('/admin');
                }
            }, 1000);
        } catch (err) {
            console.error('Erro ao selecionar filial:', err);
            setError('Erro ao selecionar filial. Tente novamente.');
        }
    };

    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    flexDirection: 'column',
                }}
            >
                <Spin size="large" />
                <Text style={{ marginTop: 16 }}>Carregando filiais...</Text>
            </div>
        );
    }

    if (error) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    flexDirection: 'column',
                }}
            >
                <Alert
                    message="Erro"
                    description={error}
                    type="error"
                    showIcon
                    style={{ maxWidth: 500 }}
                />
                <Button
                    type="primary"
                    onClick={carregarFiliais}
                    style={{ marginTop: 16 }}
                >
                    Tentar Novamente
                </Button>
                <Button
                    type="primary"
                    onClick={() => logout()}
                    style={{ marginTop: 16 }}
                >
                    Logout
                </Button>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: '#f0f2f5',
                padding: '40px 20px',
            }}
        >
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <Title level={2}>
                        <span style={{ marginRight: 8 }}>🏢</span>
                        Selecione uma Filial
                    </Title>
                    <Text type="secondary">
                        Olá, {user?.nome}! Escolha a filial onde você deseja
                        trabalhar.
                    </Text>
                </div>

                {selectedFilial && (
                    <Alert
                        message="Filial Selecionada"
                        description={`${selectedFilial.nome} - ${selectedFilial.endereco}`}
                        type="success"
                        showIcon
                        icon={<CheckCircleOutlined />}
                        style={{ marginBottom: 24 }}
                    />
                )}

                <Row gutter={[24, 24]}>
                    {filiais.map((filial) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={filial.id}>
                            <Card
                                hoverable
                                style={{
                                    height: '100%',
                                    cursor:
                                        selectedFilial?.id === filial.id
                                            ? 'default'
                                            : 'pointer',
                                    border:
                                        selectedFilial?.id === filial.id
                                            ? '2px solid #52c41a'
                                            : '1px solid #d9d9d9',
                                }}
                                onClick={() => {
                                    // console.log(filial);
                                    !selectedFilial && selecionarFilial(filial);
                                }}
                            >
                                <div style={{ textAlign: 'center' }}>
                                    <div
                                        style={{
                                            fontSize: 48,
                                            color:
                                                selectedFilial?.id === filial.id
                                                    ? '#52c41a'
                                                    : '#1890ff',
                                            marginBottom: 16,
                                        }}
                                    >
                                        🏢
                                    </div>
                                    <Title
                                        level={4}
                                        style={{ marginBottom: 8 }}
                                    >
                                        {filial.nome}
                                    </Title>
                                    <Text
                                        type="secondary"
                                        style={{
                                            display: 'block',
                                            marginBottom: 8,
                                        }}
                                    >
                                        {filial.endereco}
                                    </Text>
                                    <Text
                                        type="secondary"
                                        style={{
                                            display: 'block',
                                            marginBottom: 16,
                                        }}
                                    >
                                        {filial.telefone}
                                    </Text>

                                    {filial.permissoes &&
                                        filial.permissoes.length > 0 && (
                                            <div style={{ marginTop: 16 }}>
                                                <Text
                                                    strong
                                                    style={{
                                                        display: 'block',
                                                        marginBottom: 8,
                                                    }}
                                                >
                                                    Permissões:
                                                </Text>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: 4,
                                                    }}
                                                >
                                                    {filial.permissoes.map(
                                                        (permissao, index) => (
                                                            <span
                                                                key={index}
                                                                style={{
                                                                    background:
                                                                        '#f0f0f0',
                                                                    padding:
                                                                        '2px 8px',
                                                                    borderRadius: 12,
                                                                    fontSize: 12,
                                                                }}
                                                            >
                                                                {permissao.nome}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <div style={{ textAlign: 'center', marginTop: 40 }}>
                    <Button
                        type="primary"
                        onClick={() => logout()}
                        style={{ marginTop: 16 }}
                    >
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SelecionarFilial;
