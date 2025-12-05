// 🔧 Configuração de Rotas Baseada em Painéis
// Este arquivo mapeia as rotas aos painéis do sistema

import PermissaoRoute from "./../routes/PermissaoRoute";

export const ROTAS_CONFIG = {
    // 🏥 Processos Clínicos
    'admissao': {
        path: '/admissao/home',
        painelId: 1, // Admissao
        descricaoPainel: 'Admissao',
    },
    'enfermaria': {
        path: '/enf',
        painelId: 2, // Enfermaria
        descricaoPainel: 'Enfermaria',
    },
    'consultorio': {
        path: '/medico/consulta',
        painelId: 3, // Consultorio
        descricaoPainel: 'Consultorio',
    },
    'agendamento': {
        path: '/agenda',
        painelId: 10, // Agendamento
        descricaoPainel: 'Agendamento',
    },
    'laboratorio': {
        path: '/lab',
        painelId: 4, // Laboratorio
        descricaoPainel: 'Laboratorio',
    },

    // 🏢 Processos Administrativos
    'facturacao': {
        path: '/facturacao',
        painelId: 5, // Facturacao
        descricaoPainel: 'Facturacao',
    },
    'servicos': {
        path: '/artigo',
        painelId: 9, // Servicos
        descricaoPainel: 'Servicos',
    },
    'usuarios': {
        path: '/admin/usuario',
        painelId: 8, // Usuarios
        descricaoPainel: 'Usuarios',
    },
    'stock': {
        path: '/stock',
        painelId: 7, // Stock
        descricaoPainel: 'Stock',
    },
    'rh': {
        path: '/rh',
        painelId: 9, // RH
        descricaoPainel: 'RH',
    },
    'permissoes': {
        path: '/admin/permissoes',
        painelId: 11, // Permissoes
        descricaoPainel: 'Permissoes',
    },
    'empresa': {
        path: '/admin/empresa',
        painelId: 12, // Empresa
        descricaoPainel: 'Empresa',
    }
};

// 🎯 Função para obter configuração de uma rota
export const getRotaConfig = (chave) => {
    return ROTAS_CONFIG[chave] || null;
};

// 📋 Lista de painéis disponíveis
export const PAINEIS_DISPONIVEIS = {
    1:  { id: 1,  descricao: 'Admissao' },
    2:  { id: 2,  descricao: 'Enfermaria' },
    3:  { id: 3,  descricao: 'Consultorio' },
    4:  { id: 4,  descricao: 'Laboratorio' },
    5:  { id: 5,  descricao: 'Facturacao' },
    6:  { id: 6,  descricao: 'Servicos' },
    7: { id: 7, descricao: 'Stock' },
    8: { id: 8, descricao: 'Usuarios' },
    9: { id: 9, descricao: 'RH' },
    10: { id: 10, descricao: 'Agendamento' },
    11: { id: 11, descricao: 'Permissoes' },
    12: { id: 12, descricao: 'Empresa' }
};

export const criarRotaProtegida = (chave, componente) => {
    const config = getRotaConfig(chave);
    if (!config) return null;

    return {
        path: config.path,
        element: (
            <PermissaoRoute 
                painelId={config.painelId}
                descricaoPainel={config.descricaoPainel}
                permissao={config.permissao}
            >
                {componente}
            </PermissaoRoute>
        )
    };
}; 