import React from 'react';
import { Button, Card, Space, Typography, Alert } from 'antd';
import { usePermissoes } from '../hooks/usePermissoes';
import TrocarFilial from './TrocarFilial';
import DebugPermissoes from './DebugPermissoes';

const { Title, Text } = Typography;

const ExemploUsoPermissoes = () => {
    const { 
        permissoes, 
        loading, 
        error, 
        temPermissao, 
        temPermissaoPorModulo,
        getPermissoesPorModulo 
    } = usePermissoes();

    if (loading) {
        return <div>Carregando permissões...</div>;
    }

    if (error) {
        return <Alert message="Erro" description={error} type="error" />;
    }

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2}>Exemplo de Uso de Permissões</Title>
                <TrocarFilial />
            </div>

            <DebugPermissoes />

            <Card title="Verificação de Permissões Específicas" style={{ marginBottom: 24 }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                        <Text strong>Gerenciar Produtos: </Text>
                        {temPermissao('gerenciar_produtos') ? (
                            <Button type="primary" size="small">Acessar</Button>
                        ) : (
                            <Text type="danger">Sem permissão</Text>
                        )}
                    </div>
                    
                    <div>
                        <Text strong>Gerenciar Usuários: </Text>
                        {temPermissao('gerenciar_usuarios') ? (
                            <Button type="primary" size="small">Acessar</Button>
                        ) : (
                            <Text type="danger">Sem permissão</Text>
                        )}
                    </div>
                    
                    <div>
                        <Text strong>Visualizar Relatórios: </Text>
                        {temPermissao('visualizar_relatorios') ? (
                            <Button type="primary" size="small">Acessar</Button>
                        ) : (
                            <Text type="danger">Sem permissão</Text>
                        )}
                    </div>
                </Space>
            </Card>

            <Card title="Verificação por Módulo" style={{ marginBottom: 24 }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                        <Text strong>Módulo Financeiro: </Text>
                        {temPermissaoPorModulo('financeiro') ? (
                            <Button type="primary" size="small">Acessar</Button>
                        ) : (
                            <Text type="danger">Sem permissão</Text>
                        )}
                    </div>
                    
                    <div>
                        <Text strong>Módulo Médico: </Text>
                        {temPermissaoPorModulo('medico') ? (
                            <Button type="primary" size="small">Acessar</Button>
                        ) : (
                            <Text type="danger">Sem permissão</Text>
                        )}
                    </div>
                </Space>
            </Card>

            <Card title="Todas as Permissões do Usuário">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {permissoes.length > 0 ? (
                        permissoes.map((permissao, index) => (
                            <div key={index} style={{ 
                                padding: 8, 
                                background: permissao.ativo ? '#f6ffed' : '#fff2e8',
                                border: `1px solid ${permissao.ativo ? '#b7eb8f' : '#ffbb96'}`,
                                borderRadius: 4
                            }}>
                                <Text strong>{permissao.nome}</Text>
                                <br />
                                <Text type="secondary">Módulo: {permissao.modulo}</Text>
                                <br />
                                <Text type={permissao.ativo ? 'success' : 'warning'}>
                                    Status: {permissao.ativo ? 'Ativo' : 'Inativo'}
                                </Text>
                            </div>
                        ))
                    ) : (
                        <Text type="secondary">Nenhuma permissão encontrada</Text>
                    )}
                </Space>
            </Card>
        </div>
    );
};

export default ExemploUsoPermissoes; 