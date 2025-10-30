import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../../service/api';
import { List, Input, Button, Card, Tag, Avatar, Typography, Space, Tooltip, Empty } from 'antd';
import { SearchOutlined, UserOutlined, ClockCircleOutlined, HeartOutlined, AlertOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { ModalTriagem } from '../../util/utilitarios';
import { format, formatDistanceToNow } from 'date-fns';
import './Triagem.css';

const { Title, Text } = Typography;

function Triagem() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    // Carregar dados
    const carregarDados = useCallback(async () => {
        try {
            const r = await api.get('inscricao/all');
            const inscricoes = r.data.map(item => ({
                ...item,
                tempoEspera: new Date(item.dataCriacao),
                prioridade: item.prioridade || 'VERDE',
            }));
            setData(inscricoes);
            setFilteredData(inscricoes);
        } catch (e) {
            console.error('Erro ao carregar triagem', e);
        }
    }, []);

    useEffect(() => {
        carregarDados();
        const interval = setInterval(() => setData(prev => [...prev]), 60000);
        return () => clearInterval(interval);
    }, [carregarDados]);

    // Abrir modal
    const abrirTriagem = (id) => {
        setSelectedId(id);
        setIsModalOpen(true);
    };

<<<<<<< HEAD
    const carrgarDados = async () => {
        await api
            .get('inscricao/all')
            .then((r) => {
                console.log('Dados recebidos', r.data);
                let data = r.data.map((item, index) => {
                    Object.defineProperty(item, 'tempo', {
                        value: item.dataCriacao,
                        writable: true,
                        enumerable: true,
                        configurable: true,
                    });
                    return item;
                });
=======
    // Busca
    const buscar = useCallback((valor) => {
        const termo = valor.toLowerCase();
        const filtrados = data.filter(item =>
            item.nome.toLowerCase().includes(termo) ||
            item.inscricaoId.toString().includes(termo)
        );
        setFilteredData(filtrados);
    }, [data]);
>>>>>>> dvml-dev

    // Cores
    const corPrioridade = (p) => {
        const cores = {
            VERMELHO: '#ff4d4f',
            LARANJA: '#fa8c16',
            AMARELO: '#fadb14',
            VERDE: '#52c41a',
            AZUL: '#1890ff'
        };
        return cores[p?.toUpperCase()] || '#d9d9d9';
    };

    const corTempo = (min) => {
        if (min > 120) return '#ff4d4f';
        if (min > 60) return '#fa8c16';
        if (min > 30) return '#fadb14';
        return '#52c41a';
    };

    return (
        <div className="triagem-master">
            {/* HEADER SEM CONTADORES */}
            <div className="triagem-header">
                <Title level={2} className="triagem-titulo">
                    <HeartOutlined style={{ marginRight: 12, color: '#13c2c2' }} />
                    Triagem de Emergência
                </Title>
            </div>

            {/* CARD PRINCIPAL */}
            <Card className="triagem-card-principal">
                {/* BUSCA */}
                <div className="triagem-barra-busca">
                    <Input
                        placeholder="Buscar por nome, ID ou prontuário..."
                        prefix={<SearchOutlined className="icone-busca" />}
                        allowClear
                        size="large"
                        onChange={(e) => buscar(e.target.value)}
                        className="input-busca"
                    />
                </div>

                {/* LISTA */}
                <List
                    dataSource={filteredData}
                    locale={{
                        emptyText: (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={<Text type="secondary" strong>Nenhum paciente na fila de triagem</Text>}
                            />
                        )
                    }}
                    renderItem={(item) => {
                        const minutos = Math.floor((new Date() - new Date(item.tempoEspera)) / 60000);
                        const corPri = corPrioridade(item.prioridade);
                        const corTemp = corTempo(minutos);

                        return (
                            <List.Item
                                key={item.inscricaoId}
                                className="triagem-paciente"
                                style={{ borderLeft: `8px solid ${corPri}` }}
                            >
                                <div className="triagem-conteudo">
                                    {/* AVATAR + ALERTA */}
                                    <div className="triagem-avatar-container">
                                        <Avatar
                                            size={68}
                                            icon={<UserOutlined />}
                                            style={{
                                                backgroundColor: corPri,
                                                fontWeight: 'bold',
                                                fontSize: 28,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                            }}
                                        />
                                        {item.prioridade === 'VERMELHO' && (
                                            <AlertOutlined className="alerta-urgente" />
                                        )}
                                    </div>

                                    {/* DETALHES */}
                                    <div className="triagem-detalhes">
                                        <Title level={4} className="nome-paciente">
                                            {item.nome}
                                        </Title>
                                        <Space size={16} wrap>
                                            <Text type="secondary">
                                                <FieldTimeOutlined style={{ color: '#13c2c2' }} />{' '}
                                                {formatDistanceToNow(new Date(item.tempoEspera), { addSuffix: true })}
                                            </Text>
                                            <Tag color={corTemp} className="tag-tempo">
                                                <ClockCircleOutlined /> <strong>{minutos} min</strong>
                                            </Tag>
                                            <Tag color={corPri} className="tag-prioridade">
                                                {item.prioridade}
                                            </Tag>
                                        </Space>
                                        <Text type="secondary" className="info-extra">
                                            Prontuário: <strong>{item.inscricaoId}</strong> • Entrada: {format(new Date(item.tempoEspera), 'dd/MM/yyyy HH:mm')}
                                        </Text>
                                    </div>

                                    {/* BOTÃO */}
                                    <Tooltip title="Iniciar triagem com protocolo completo">
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<HeartOutlined />}
                                            className="btn-triar"
                                            onClick={() => abrirTriagem(item.inscricaoId)}
                                        >
                                            Triar Paciente
                                        </Button>
                                    </Tooltip>
                                </div>
                            </List.Item>
                        );
                    }}
                />
            </Card>

            {/* MODAL EXTERNO */}
            <ModalTriagem
                estado={isModalOpen}
                inscricaoId={selectedId}
                usuarioId={1}
                onCancel={() => setIsModalOpen(false)}
                exibirEncaminhamento={true}
                exibirManchester={true}
                carrgarDados={carregarDados}
            />
        </div>
    );
}

export default Triagem;