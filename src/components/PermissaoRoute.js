import React, { useContext } from 'react';
import { usePermissoes } from '../hooks/usePermissoes';
import { Spin, Alert, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/auth';

const PermissaoRoute = ({ 
    children, 
    permissao, 
    modulo, 
    tipoPainel,
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
        temAcessoPorTipo,
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

    // Verificar permissão específica
    if (permissao && !temPermissao(permissao)) {
        if (fallback) return fallback;
        
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
                    description={`Você não tem permissão para acessar esta funcionalidade. (${permissao})`}
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

    // Verificar permissão por módulo
    if (modulo && !temPermissaoPorModulo(modulo)) {
        if (fallback) return fallback;
        
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
                    description={`Você não tem permissão para acessar o módulo ${modulo}.`}
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

    // Verificar acesso ao painel por ID
    if (painelId && !temAcessoAoPainel(painelId)) {
        if (fallback) return fallback;
        
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
                    description={`Você não tem permissão para acessar este painel. (ID: ${painelId})`}
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

    // Verificar acesso ao painel por descrição
    if (descricaoPainel && !temAcessoAoPainelPorDescricao(descricaoPainel)) {
        if (fallback) return fallback;
        
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
                    description={`Você não tem permissão para acessar o painel: ${descricaoPainel}`}
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

    // Verificar acesso ao painel baseado no tipo de usuário (fallback)
    if (tipoPainel && !temAcessoPorTipo(tipoPainel)) {
        if (fallback) return fallback;
        
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
                    description={`Você não tem permissão para acessar o painel ${tipoPainel}. Seu tipo: ${user?.tipo}`}
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