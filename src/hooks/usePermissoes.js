import { useEffect, useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../contexts/auth';
import { api } from '../service/api';

export const usePermissoes = () => {
    const { user } = useContext(AuthContext);
    const [permissoes, setPermissoes] = useState([]);
    const [painels, setPainels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user?.id && user?.filialSelecionada?.id) {
            carregarPermissoes();
        }
    }, [user?.id, user?.filialSelecionada?.id]);

    const carregarPermissoes = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Buscar permissões do usuário na filial
            const permissoesResponse = await api.get(`/painelpermissoes/usuario/${user.id}/filial/${user.filialSelecionada.id}`);
            
            if (permissoesResponse.data && permissoesResponse.data.length > 0) {
                setPermissoes(permissoesResponse.data);
                
                // Buscar informações dos painéis
                const painelIds = [...new Set(permissoesResponse.data.map(p => p.painelId))];
                const painelsCompletos = [];
                
                for (const painelId of painelIds) {
                    try {
                        const painelResponse = await api.get(`painel/${painelId}`);
                        if (painelResponse.data) {
                            painelsCompletos.push(painelResponse.data);
                        }
                    } catch (painelErr) {
                        console.error(`Erro ao carregar painel ${painelId}:`, painelErr);
                    }
                }
                
                setPainels(painelsCompletos);
            } else {
                setPermissoes([]);
                setPainels([]);
            }
        } catch (err) {
            console.error('Erro ao carregar permissões:', err);
            setError('Erro ao carregar permissões');
            setPermissoes([]);
            setPainels([]);
        } finally {
            setLoading(false);
        }
    };

    // Verificar se o usuário tem acesso a um painel específico
    const temAcessoAoPainel = (painelId) => {
        if (!user?.filialSelecionada) return false;
        
        return permissoes.some(permissao => 
            permissao.painelId === painelId && permissao.ativo === true
        );
    };

    // Verificar se o usuário tem acesso a um painel por descrição
    const temAcessoAoPainelPorDescricao = (descricaoPainel) => {
        if (!user?.filialSelecionada) return false;
        
        const painel = painels.find(p => 
            p.descricao.toLowerCase() === descricaoPainel.toLowerCase()
        );
        
        if (!painel) return false;
        
        return temAcessoAoPainel(painel.id);
    };

    // Verificar permissão específica (mantido para compatibilidade)
    const temPermissao = (nomePermissao) => {
        if (!user?.filialSelecionada) return false;
        
        return permissoes.some(permissao => 
            permissao.nome === nomePermissao && permissao.ativo === true
        );
    };

    // Verificar permissão por módulo (mantido para compatibilidade)
    const temPermissaoPorModulo = (modulo) => {
        if (!user?.filialSelecionada) return false;
        
        return permissoes.some(permissao => 
            permissao.modulo === modulo && permissao.ativo === true
        );
    };

    // Obter permissões por módulo (mantido para compatibilidade)
    const getPermissoesPorModulo = (modulo) => {
        if (!user?.filialSelecionada) return [];
        
        return permissoes.filter(permissao => 
            permissao.modulo === modulo && permissao.ativo === true
        );
    };

    // Obter todos os painéis que o usuário tem acesso
    const getPainelsAcessiveis = () => {
        return painels.filter(painel => temAcessoAoPainel(painel.id));
    };

    // Verificar acesso baseado no tipo de usuário (fallback)
    const temAcessoPorTipo = (tipoPainel) => {
        const tiposPermitidos = {
            'admin': ['admin', 'administrativo', 'ADMINISTRATIVO'],
            'medico': ['medico', 'admin', 'administrativo'],
            'enfermeiro': ['enfermeiro', 'admin', 'administrativo', 'ADMINISTRATIVO'],
            'analista': ['analista', 'admin', 'administrativo']
        };
        
        const tipoUsuario = user?.tipo;
        const tiposAceitos = tiposPermitidos[tipoPainel] || [];
        
        return tiposAceitos.includes(tipoUsuario);
    };

    return {
        permissoes,
        painels,
        loading,
        error,
        temPermissao,
        temPermissaoPorModulo,
        getPermissoesPorModulo,
        temAcessoAoPainel,
        temAcessoAoPainelPorDescricao,
        getPainelsAcessiveis,
        temAcessoPorTipo,
        recarregarPermissoes: carregarPermissoes
    };
};
