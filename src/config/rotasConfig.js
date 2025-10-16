// 🔧 Configuração de Rotas Baseada em Painéis
// Este arquivo mapeia as rotas aos painéis do sistema

import PermissaoRoute from "../components/PermissaoRoute";

export const ROTAS_CONFIG = {
    // 🏥 Processos Clínicos
    'admissao': {
        path: '/admissao/home',
        painelId: 4, // Admissao
        descricaoPainel: 'Admissao',
    },
    'enfermaria': {
        path: '/enf',
        painelId: 5, // Enfermaria
        descricaoPainel: 'Enfermaria',
    },
    'consultorio': {
        path: '/medico/consulta',
        painelId: 6, // Consultorio
        descricaoPainel: 'Consultorio',
    },
    'agendamento': {
        path: '/agenda',
        painelId: 13, // Agendamento
        descricaoPainel: 'Agendamento',
    },
    'laboratorio': {
        path: '/lab',
        painelId: 7, // Laboratorio
        descricaoPainel: 'Laboratorio',
    },

    // 🏢 Processos Administrativos
    'facturacao': {
        path: '/facturacao',
        painelId: 8, // Facturacao
        descricaoPainel: 'Facturacao',
    },
    'servicos': {
        path: '/artigo',
        painelId: 9, // Servicos
        descricaoPainel: 'Servicos',
    },
    'usuarios': {
        path: '/admin/usuario',
        painelId: 11, // Usuarios
        descricaoPainel: 'Usuarios',
    },
    'stock': {
        path: '/stock',
        painelId: 10, // Stock
        descricaoPainel: 'Stock',
    },
    'rh': {
        path: '/rh',
        painelId: 12, // RH
        descricaoPainel: 'RH',
    }
};

// 🎯 Função para obter configuração de uma rota
export const getRotaConfig = (chave) => {
    return ROTAS_CONFIG[chave] || null;
};

// 📋 Lista de painéis disponíveis
export const PAINEIS_DISPONIVEIS = {
    4:  { id: 4,  descricao: 'Admissao' },
    5:  { id: 5,  descricao: 'Enfermaria' },
    6:  { id: 6,  descricao: 'Consultorio' },
    7:  { id: 7,  descricao: 'Laboratorio' },
    8:  { id: 8,  descricao: 'Facturacao' },
    9:  { id: 9,  descricao: 'Servicos' },
    10: { id: 10, descricao: 'Stock' },
    11: { id: 11, descricao: 'Usuarios' },
    12: { id: 12, descricao: 'RH' },
    13: { id: 13, descricao: 'Agendamento' }
};

// (Removido) Verificação por tipo de usuário deixou de ser utilizada.

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
                permissao={config.permissao}
            >
                {componente}
            </PermissaoRoute>
        )
    };
}; 