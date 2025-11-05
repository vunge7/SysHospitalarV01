// api.js - ATUALIZADO
import axios from 'axios';

const ip = 'localhost'; // Substitua pelo IP do servidor backend se necessário


export const api = axios.create({
    baseURL: `http://${ip}:8081/`,
    withCredentials: true,
});

// Adiciona o token JWT no header Authorization se existir
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Adicione esta linha no seu api.js


// Função para buscar filiais associadas a um usuário (retorna IDs)
export const fetchFiliaisByUsuarioId = (usuarioId) => api.get(`/painelpermissoes/usuario/${usuarioId}/filiais`);

// Função para buscar TODAS as filiais (com id e nome)
export const fetchAllFiliais = () => api.get('/empresa/filial/all');

// Painéis
// Buscar todos os painéis disponíveis
export const fetchAllPainels = () => api.get('/painel/all');

// Permissões de Painel
// Buscar permissões de um usuário em uma filial específica
export const fetchUserPermissions = (usuarioId, filialId) => 
    api.get(`/painelpermissoes/usuario/${usuarioId}/filial/${filialId}`);

// Buscar todas as permissões de um usuário
export const fetchAllUserPermissions = (usuarioId) => 
    api.get(`/painelpermissoes/usuario/${usuarioId}`);

// Buscar filiais às quais o usuário tem permissão
export const fetchUserPermissionedFiliais = (usuarioId) =>
    api.get(`/painelpermissoes/usuario/${usuarioId}/filiais`);

// Adicionar permissão de painel para um usuário
export const addPanelPermission = (painelPermissaoDTO, usuarioIdCriacao) => 
    api.post('/painelpermissoes/add', painelPermissaoDTO, {
        headers: {
            'Usuario-Id': usuarioIdCriacao || 1
        }
    });

// Remover permissão de painel de um usuário
export const removePanelPermission = (permissaoId) => 
    api.delete(`/painelpermissoes/${permissaoId}`);

// Atualizar permissão de painel
export const updatePanelPermission = (id, painelPermissaoDTO, usuarioIdAtualizacao) =>
    api.put(`/painelpermissoes/${id}`, painelPermissaoDTO, {
        headers: {
            'Usuario-Id': usuarioIdAtualizacao || 1
        }
    });

// Função para buscar usuários de uma filial específica
export const fetchUsersByFilialId = async (filialId) => {
    try {
        // Primeiro, busca todos os usuários
        const allUsersResponse = await api.get('/usuario/all');
        const allUsers = Array.isArray(allUsersResponse.data) ? allUsersResponse.data : [];
        
        // Para cada usuário, verifica se tem permissão na filial
        const usersInFilial = [];
        
        for (const user of allUsers) {
            try {
                const response = await api.get(`/painelpermissoes/usuario/${user.id}/filial/${filialId}`);
                if (response.data && response.data.length > 0) {
                    usersInFilial.push(user);
                }
            } catch (error) {
                console.error(`Erro ao verificar permissões do usuário ${user.id}:`, error);
            }
        }
        
        return { data: usersInFilial };
    } catch (error) {
        console.error('Erro ao buscar usuários da filial:', error);
        return { data: [] };
    }
};

// Função para buscar todos os usuários
export const fetchAllUsers = () => api.get('/usuario/all');

// Função para buscar usuários que não estão em uma filial
export const fetchUsersNotInFilial = async (filialId) => {
    try {
        // Primeiro, busca todos os usuários
        const allUsersResponse = await fetchAllUsers();
        const allUsers = Array.isArray(allUsersResponse.data) ? allUsersResponse.data : [];
        
        // Depois, busca os usuários que já estão na filial
        const usersInFilialResponse = await fetchUsersByFilialId(filialId);
        const usersInFilial = Array.isArray(usersInFilialResponse.data) ? usersInFilialResponse.data : [];
        
        // Filtra os usuários que não estão na filial
        const usersNotInFilial = allUsers.filter(user => 
            !usersInFilial.some(u => u.id === user.id)
        );
        
        return { data: usersNotInFilial };
    } catch (error) {
        console.error('Erro ao buscar usuários não afiliados:', error);
        return { data: [] };
    }
};

// Função para adicionar um usuário a uma filial
export const addUserToBranch = async (filialId, usuarioId) => {
    // Cria uma nova permissão para o usuário na filial
    const painelPermissaoDTO = {
        usuarioId: parseInt(usuarioId),
        filialId: parseInt(filialId),
        // Outros campos necessários para a criação da permissão
        ativo: true,
        dataCriacao: new Date().toISOString(),
        usuarioCriacaoId: 1 // Substitua pelo ID do usuário logado
    };
    
    return api.post('/painelpermissoes/add', painelPermissaoDTO);
};

// Função para remover um usuário de uma filial
export const removeUserFromBranch = (painelPermissoesId) => 
    api.delete(`/painelpermissoes/${painelPermissoesId}`);

// Função para buscar uma Pessoa por ID
export const fetchPessoaById = (pessoaId) => api.get(`/pessoa/${pessoaId}`);

// Função para buscar um Funcionario por ID
export const fetchFuncionarioById = (funcionarioId) => api.get(`/funcionario/${funcionarioId}`);