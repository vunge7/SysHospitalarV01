// api.js - ATUALIZADO
import axios from 'axios';

const ip = 'localhost';
var nome = "dvml";

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

// Função para buscar filiais associadas a um usuário (retorna IDs)
export const fetchFiliaisByUsuarioId = (usuarioId) => api.get(`/painelpermissoes/usuario/${usuarioId}/empresas`);

// Função para buscar TODAS as filiais (com id e nome)
export const fetchAllFiliais = () => api.get('/empresa/filial/all');

// Painéis
// Buscar todos os painéis disponíveis
export const fetchAllPainels = () => api.get('/painel/all');

// Permissões de Painel
// Buscar permissões de um usuário em uma filial específica
export const fetchUserPermissions = (usuarioId, filialId) => 
    api.get(`/painelpermissoes/usuario/${usuarioId}/empresa/${filialId}`);

// Buscar todas as permissões de um usuário
export const fetchAllUserPermissions = (usuarioId) => 
    api.get(`/painelpermissoes/usuario/${usuarioId}`);

// Buscar filiais às quais o usuário tem permissão
export const fetchUserPermissionedFiliais = (usuarioId) =>
    api.get(`/painelpermissoes/usuario/${usuarioId}/empresas`);

// Adicionar permissão de painel para um usuário
export const addPanelPermission = (painelPermissaoDTO, usuarioIdCriacao) => 
    api.post('/painelpermissoes/add', painelPermissaoDTO, {
        headers: {
            'Usuario-Id': usuarioIdCriacao || 1
        }
    });

// Empresas (Empresa Mãe) APIs
export const fetchAllEmpresas = () => api.get('/empresa/all');
export const fetchEmpresaById = (id) => api.get(`/empresa/${id}`);
export const fetchFilialById = (id) => api.get(`/empresa/filial/${id}`);
export const fetchEmpresaArvore = () => api.get('/empresa/arvore');
export const createEmpresa = (empresa) => api.post('/empresa/add', empresa);
export const updateEmpresa = (id, empresa) => api.put(`/empresa/${id}`, empresa);
export const deleteEmpresa = (id) => api.delete(`/empresa/${id}`);
export const deleteEmpresaCascade = (id) => api.delete(`/empresa/${id}/cascade`);

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
                const response = await api.get(`/painelpermissoes/usuario/${user.id}/empresa/${filialId}`);
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

// Função para adicionar um usuário a uma empresa
export const addUserToBranch = async (filialId, usuarioId, empresaId, usuarioLogadoId) => {
    try {
        // Primeiro, verifica se o usuário já tem permissão nesta empresa
        const existingPermissions = await api.get(`/painelpermissoes/usuario/${usuarioId}/empresa/${empresaId}`);
        
        if (existingPermissions.data && existingPermissions.data.length > 0) {
            console.log('Usuário já tem permissão nesta empresa:', existingPermissions.data);
            throw new Error('Este usuário já tem permissão nesta empresa');
        }

        const formatDate = () => {
            const now = new Date();

            // Obtém componentes no fuso horário local
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0'); // +1 porque meses são 0-11
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');

            // Monta no formato desejado: "YYYY-MM-DD HH:mm:ss"
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        };

const dataAtual = formatDate();
        
        // Cria uma nova permissão para o usuário na empresa
        // Cria o objeto com as datas já como strings formatadas
        const painelPermissaoDTO = {
            usuarioId: parseInt(usuarioId),
            painelId: 1,
            empresaId: parseInt(empresaId), // Campo obrigatório (corrigido)
            dataCriacao: dataAtual,
            usuarioIdCriacao: parseInt(usuarioLogadoId) || 1,
            dataActualizacao: dataAtual, // Mesma data de criação
            usuarioIdActualizacao: parseInt(usuarioLogadoId) || 1
        };
        
        console.log('Enviando requisição para adicionar usuário à filial:', painelPermissaoDTO);
        const response = await api.post('/painelpermissoes/add', painelPermissaoDTO);
        console.log('Resposta da API ao adicionar usuário:', response.data);
        return response;
    } catch (error) {
        console.error('Erro detalhado ao adicionar usuário à filial:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers
        });
        throw error;
    }
};

// Função para remover um usuário de uma filial
export const removeUserFromBranch = (painelPermissoesId) => 
    api.delete(`/painelpermissoes/${painelPermissoesId}`);

// Função para buscar uma Pessoa por ID
export const fetchPessoaById = (pessoaId) => api.get(`/pessoa/${pessoaId}`);

// Função para buscar um Funcionario por ID
export const fetchFuncionarioById = (funcionarioId) => api.get(`/funcionario/${funcionarioId}`);