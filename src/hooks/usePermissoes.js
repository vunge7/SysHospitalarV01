import { useEffect, useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../contexts/auth';
import { api } from '../service/api';
import { getRotaConfig } from '../config/rotasConfig';

export const usePermissoes = () => {
    const { user, permissoes, setPermissoes } = useContext(AuthContext);

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
            // const permissoesResponse = await api.get(`/painelpermissoes/usuario/${user.id}/filial/${user.filialSelecionada.id}`);

            const parseXmlList = (xmlString) => {
                try {
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(
                        xmlString,
                        'application/xml'
                    );
                    const items = Array.from(xml.getElementsByTagName('item'));
                    return items.map((node) => ({
                        id: Number(
                            node.getElementsByTagName('id')?.[0]?.textContent ||
                                0
                        ),
                        dataCriacao:
                            node.getElementsByTagName('dataCriacao')?.[0]
                                ?.textContent || null,
                        dataActualizacao:
                            node.getElementsByTagName('dataActualizacao')?.[0]
                                ?.textContent || null,
                        usuarioIdCriacao: Number(
                            node.getElementsByTagName('usuarioIdCriacao')?.[0]
                                ?.textContent || 0
                        ),
                        usuarioIdActualizacao: Number(
                            node.getElementsByTagName(
                                'usuarioIdActualizacao'
                            )?.[0]?.textContent || 0
                        ),
                        painelId: Number(
                            node.getElementsByTagName('painelId')?.[0]
                                ?.textContent || 0
                        ),
                        usuarioId: Number(
                            node.getElementsByTagName('usuarioId')?.[0]
                                ?.textContent || 0
                        ),
                        filialId: Number(
                            node.getElementsByTagName('filialId')?.[0]
                                ?.textContent || 0
                        ),
                        ativo: true,
                    }));
                } catch (e) {
                    console.error('Falha ao parsear XML de permissões:', e);
                    return [];
                }
            };

            const storageUser = localStorage.getItem('@sysHospitalarPRO');
            let perm = [];
            if (storageUser) {
                const userData = JSON.parse(storageUser);
                 perm = userData.permissoes || [];
            }
            const dataRaw = perm;
            const lista = Array.isArray(dataRaw)
                ? dataRaw
                : typeof dataRaw === 'string' && dataRaw.trim().startsWith('<')
                  ? parseXmlList(dataRaw)
                  : dataRaw?.List?.item ||
                    dataRaw?.content ||
                    dataRaw?.items ||
                    [];

            if (lista && lista.length > 0) {
                // Normalizar campos (snake_case -> camelCase, booleanos em string -> boolean)
                const normalizados = lista.map((p) => ({
                    id: p.id,
                    usuarioId:
                        p.usuarioId ?? p.usuario_id ?? p.userId ?? p.user_id,
                    filialId: p.filialId ?? p.filial_id,
                    painelId: p.painelId ?? p.painel_id,
                    nome: p.nome ?? p.permission ?? p.permissao,
                    modulo: p.modulo ?? p.module,
                    ativo:
                        typeof p.ativo === 'boolean'
                            ? p.ativo
                            : String(p.ativo).toLowerCase() === 'true',
                    descricao: p.descricao ?? p.description,
                }));

                setPermissoes(normalizados);

                // Buscar informações dos painéis
                const painelIds = [
                    ...new Set(normalizados.map((p) => p.painelId)),
                ].filter(Boolean);
                const painelsCompletos = [];

                for (const painelId of painelIds) {
                    try {
                        const painelResponse = await api.get(
                            `/painel/${painelId}`
                        );
                        if (painelResponse.data) {
                            painelsCompletos.push(painelResponse.data);
                        }
                    } catch (painelErr) {
                        console.error(
                            `Erro ao carregar painel ${painelId}:`,
                            painelErr
                        );
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

    const normalizeString = (value) => {
        if (typeof value !== 'string') return '';
        return value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    };

    // Verificar se o usuário tem acesso a um painel específico
    const temAcessoAoPainel = (painelId) => {
        if (!user?.filialSelecionada) return false;

        return permissoes.some((permissao) => permissao.painelId === painelId);
    };

    // Verificar se o usuário tem acesso a um painel por descrição
    const temAcessoAoPainelPorDescricao = (descricaoPainel) => {
        if (!user?.filialSelecionada) return false;

        const alvo = normalizeString(descricaoPainel);
        const painel = painels.find(
            (p) => normalizeString(p.descricao) === alvo
        );

        if (!painel) return false;

        return temAcessoAoPainel(painel.id);
    };

    // Verificar permissão específica (mantido para compatibilidade)
    const temPermissao = (nomePermissao) => {
        if (!user?.filialSelecionada) return false;
        const alvo = normalizeString(nomePermissao);
        return permissoes.some(
            (permissao) =>
                normalizeString(permissao.nome) === alvo &&
                permissao.ativo === true
        );
    };

    // Verificar permissão por módulo (mantido para compatibilidade)
    const temPermissaoPorModulo = (modulo) => {
        if (!user?.filialSelecionada) return false;
        const alvo = normalizeString(modulo);
        return permissoes.some(
            (permissao) =>
                normalizeString(permissao.modulo) === alvo &&
                permissao.ativo === true
        );
    };

    // Obter permissões por módulo (mantido para compatibilidade)
    const getPermissoesPorModulo = (modulo) => {
        if (!user?.filialSelecionada) return [];
        const alvo = normalizeString(modulo);
        return permissoes.filter(
            (permissao) =>
                normalizeString(permissao.modulo) === alvo &&
                permissao.ativo === true
        );
    };

    // Obter todos os painéis que o usuário tem acesso
    const getPainelsAcessiveis = () => {
        return painels.filter((painel) => temAcessoAoPainel(painel.id));
    };

    // Utilitário: filtra permissões por critérios granulares
    const getPermissoesFiltradas = ({
        usuarioId,
        modulo,
        nome,
        painelId,
        ativo,
    } = {}) => {
        return permissoes.filter((p) => {
            if (usuarioId && p.usuarioId !== usuarioId) return false;
            if (typeof ativo === 'boolean' && p.ativo !== ativo) return false;
            if (
                modulo &&
                (p.modulo || '').toLowerCase() !== modulo.toLowerCase()
            )
                return false;
            if (nome && (p.nome || '').toLowerCase() !== nome.toLowerCase())
                return false;
            if (painelId && p.painelId !== painelId) return false;
            return true;
        });
    };

    // Verificar acesso completo a uma rota baseada em ROTAS_CONFIG
    const temAcessoARota = (chaveRota) => {
        const config = getRotaConfig(chaveRota);
        if (!config) return false;

        const painelOk =
            (config.painelId && temAcessoAoPainel(config.painelId)) ||
            (config.descricaoPainel &&
                temAcessoAoPainelPorDescricao(config.descricaoPainel));
        return Boolean(painelOk);
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
        getPermissoesFiltradas,
        temAcessoARota,
        recarregarPermissoes: carregarPermissoes,
    };
};
