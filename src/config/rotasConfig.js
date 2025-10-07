// 🔧 Configuração de Rotas Baseada em Painéis
// Este arquivo mapeia as rotas aos painéis do sistema

import PermissaoRoute from "../components/PermissaoRoute";

export const ROTAS_CONFIG = {
    // 🏥 Processos Clínicos
    'admissao': {
        path: '/admissao/home',
        painelId: 1, // Administrativo
        descricaoPainel: 'Administrativo',
        tipoPainel: 'administrativo',
        permissao: 'acesso_admissao'
    },
    'enfermaria': {
        path: '/enf',
        painelId: 6, // Enfermaria
        descricaoPainel: 'Enfermaria',
        tipoPainel: 'ADMINISTRATIVO',
        permissao: 'acesso_enfermaria'
    },
    'consultorio': {
        path: '/medico/consulta',
        painelId: 2, // Médico
        descricaoPainel: 'Médico',
        tipoPainel: 'medico',
        permissao: 'acesso_consultorio'
    },
    'agenda': {
        path: '/agenda',
        painelId: 1, // Administrativo
        descricaoPainel: 'Administrativo',
        tipoPainel: 'administrativo',
        permissao: 'acesso_agenda'
    },
    'laboratorio': {
        path: '/lab',
        painelId: 5, // Laboratório
        descricaoPainel: 'Laboratório',
        tipoPainel: 'analista',
        permissao: 'acesso_laboratorio'
    },

    // 🏢 Processos Administrativos
    'facturacao': {
        path: '/facturacao',
        painelId: 1, // Administrativo
        descricaoPainel: 'Administrativo',
        tipoPainel: 'administrativo',
        permissao: 'acesso_facturacao'
    },
    'servicos': {
        path: '/artigo',
        painelId: 1, // Administrativo
        descricaoPainel: 'admin',
        tipoPainel: 'administrativo',
        permissao: 'gerenciar_produtos'
    },
    'usuarios': {
        path: '/admin/usuario',
        painelId: 1, // Administrativo
        descricaoPainel: 'Administrativo',
        tipoPainel: 'administrativo',
        permissao: 'gerenciar_usuarios'
    },
    'stock': {
        path: '/stock',
        painelId: 1, // Administrativo
        descricaoPainel: 'Administrativo',
        tipoPainel: 'administrativo',
        permissao: 'gerenciar_stock'
    },
    'rh': {
        path: '/rh',
        painelId: 1, // Administrativo
        descricaoPainel: 'Administrativo',
        tipoPainel: 'administrativo',
        permissao: 'acesso_rh'
    }
};

// 🎯 Função para obter configuração de uma rota
export const getRotaConfig = (chave) => {
    return ROTAS_CONFIG[chave] || null;
};

// 📋 Lista de painéis disponíveis
export const PAINEIS_DISPONIVEIS = {
    1: { id: 1, descricao: 'Administrativo', tipo: 'administrativo' },
    2: { id: 2, descricao: 'Médico', tipo: 'medico' },
    3: { id: 3, descricao: 'Enfermeiro', tipo: 'enfermeiro' },
    4: { id: 4, descricao: 'Analista', tipo: 'analista' },
    5: { id: 5, descricao: 'Laboratório', tipo: 'analista' },
    6: { id: 6, descricao: 'Enfermaria', tipo: 'enfermeiro' }
};

// 🔍 Função para verificar se um usuário tem acesso a uma rota
export const verificarAcessoRota = (chave, user, permissoes) => {
    const config = getRotaConfig(chave);
    if (!config) return false;

    // Verificar por tipo de usuário
    const tiposPermitidos = {
        'administrativo': ['administrativo', 'admin'],
        'medico': ['medico', 'administrativo', 'admin'],
        'enfermeiro': ['enfermeiro', 'administrativo', 'admin'],
        'analista': ['analista', 'administrativo', 'admin']
    };

    const tipoUsuario = user?.tipo;
    const tiposAceitos = tiposPermitidos[config.tipoPainel] || [];
    
    return tiposAceitos.includes(tipoUsuario);
};

// 📊 Exemplo de uso no componente de rotas
export const criarRotaProtegida = (chave, componente) => {
    const config = getRotaConfig(chave);
    if (!config) return null;

    return {
        path: config.path,
        element: (
            <PermissaoRoute 
                painelId={config.painelId}
                descricaoPainel={config.descricaoPainel}
                tipoPainel={config.tipoPainel}
                permissao={config.permissao}
            >
                {componente}
            </PermissaoRoute>
        )
    };
}; 