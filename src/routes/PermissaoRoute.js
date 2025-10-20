import React, { useContext } from 'react';
import { usePermissoes } from '../hooks/usePermissoes';
import { Spin, Alert, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/auth';

const PermissaoRoute = ({ 
    children, 
    permissao, 
    modulo, 
    painelId,
    descricaoPainel,
    fallback = null,
    redirectTo = '/selecionar-filial'
}) => {
    const { 
        temPermissao, 
        temPermissaoPorModulo, 
        temAcessoAoPainel, 
        temAcessoAoPainelPorDescricao,
        loading, 
        error 
    } = usePermissoes();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                flexDirection: 'column'
            }}>
                <Alert
                    message="Erro de Permissão"
                    description="Não foi possível verificar suas permissões. Tente novamente."
                    type="error"
                    showIcon
                    style={{ maxWidth: 500, marginBottom: 16 }}
                />
                <Button type="primary" onClick={() => window.location.reload()}>
                    Tentar Novamente
                </Button>
            </div>
        );
    }

    // Novo fluxo: concede acesso se QUALQUER critério for verdadeiro
    const allowedByPermissao = permissao ? temPermissao(permissao) : false;
    const allowedByModulo = modulo ? temPermissaoPorModulo(modulo) : false;
    const allowedByPainelId = painelId ? temAcessoAoPainel(painelId) : false;
    const allowedByPainelDesc = descricaoPainel ? temAcessoAoPainelPorDescricao(descricaoPainel) : false;
    const isAllowed = allowedByPermissao || allowedByModulo || allowedByPainelId || allowedByPainelDesc;

    if (!isAllowed) {
        if (fallback) return fallback;
        const motivo = permissao
            ? `Você não tem permissão para acessar esta funcionalidade. (${permissao})`
            : modulo
                ? `Você não tem permissão para acessar o módulo ${modulo}.`
                : painelId
                    ? `Você não tem permissão para acessar este painel. (ID: ${painelId})`
                    : descricaoPainel
                        ? `Você não tem permissão para acessar o painel: ${descricaoPainel}`
                        : `Você não tem permissão para acessar.`;

        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                flexDirection: 'column'
            }}>
                <Alert
                    message="Acesso Negado"
                    description={motivo}
                    type="warning"
                    showIcon
                    style={{ maxWidth: 500, marginBottom: 16 }}
                />
                <Button type="primary" onClick={() => navigate(redirectTo)}>
                    Voltar
                </Button>
            </div>
        );
    }

    return children;
};

export default PermissaoRoute; 