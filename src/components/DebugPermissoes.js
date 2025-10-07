import React from 'react';
import { Card, Typography, Tag, Space } from 'antd';
import { usePermissoes } from '../hooks/usePermissoes';
import { AuthContext } from '../contexts/auth';
import { useContext } from 'react';

const { Text } = Typography;

const DebugPermissoes = () => {
    const { user } = useContext(AuthContext);
    const { permissoes, painels, loading, error } = usePermissoes();

    if (loading) {
        return <div>Carregando permissões...</div>;
    }

    if (error) {
        return <div>Erro: {error}</div>;
    }

    return (
        <Card title="🔍 Debug de Permissões" style={{ margin: '20px 0' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                    <Text strong>Usuário:</Text> {user?.nome} (ID: {user?.id})
                </div>
                <div>
                    <Text strong>Filial Selecionada:</Text> {user?.filialSelecionada?.nome} (ID: {user?.filialSelecionada?.id})
                </div>
                <div>
                    <Text strong>Tipo de Usuário:</Text> {user?.tipo}
                </div>
                
                <div style={{ marginTop: 16 }}>
                    <Text strong>Total de Permissões:</Text> {permissoes.length}
                </div>
                
                <div style={{ marginTop: 16 }}>
                    <Text strong>Total de Painéis:</Text> {painels.length}
                </div>
                
                {permissoes.length > 0 ? (
                    <div>
                        <Text strong>Permissões Disponíveis:</Text>
                        <div style={{ marginTop: 8 }}>
                            {permissoes.map((permissao, index) => (
                                <Tag 
                                    key={index} 
                                    color={permissao.ativo ? 'green' : 'red'}
                                    style={{ margin: '4px' }}
                                >
                                    {permissao.nome} 
                                    {permissao.modulo && ` (${permissao.modulo})`}
                                    {permissao.painelId && ` [Painel: ${permissao.painelId}]`}
                                    {permissao.ativo ? ' ✅' : ' ❌'}
                                </Tag>
                            ))}
                        </div>
                    </div>
                ) : (
                    <Text type="warning">Nenhuma permissão encontrada!</Text>
                )}
                
                {painels.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                        <Text strong>Painéis Disponíveis:</Text>
                        <div style={{ marginTop: 8 }}>
                            {painels.map((painel, index) => (
                                <Tag 
                                    key={index} 
                                    color="blue"
                                    style={{ margin: '4px' }}
                                >
                                    {painel.descricao} (ID: {painel.id})
                                </Tag>
                            ))}
                        </div>
                    </div>
                )}
                
                <div style={{ marginTop: 16 }}>
                    <Text strong>Testes de Acesso:</Text>
                    <div style={{ marginTop: 8 }}>
                        <Tag color="blue">Admin: {user?.tipo === 'admin' ? '✅' : '❌'}</Tag>
                        <Tag color="blue">Médico: {user?.tipo === 'medico' ? '✅' : '❌'}</Tag>
                        <Tag color="blue">Enfermeiro: {user?.tipo === 'enfermeiro' ? '✅' : '❌'}</Tag>
                        <Tag color="blue">Analista: {user?.tipo === 'analista' ? '✅' : '❌'}</Tag>
                    </div>
                </div>
            </Space>
        </Card>
    );
};

export default DebugPermissoes; 