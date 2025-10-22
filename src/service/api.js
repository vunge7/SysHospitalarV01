// api.js - ATUALIZADO
import axios from 'axios';

const ip = 'localhost';


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
export const fetchFiliaisByUsuarioId = (usuarioId) => api.get(`/painelpermissoes/usuario/${usuarioId}/filiais`);

// Função para buscar TODAS as filiais (com id e nome)
export const fetchAllFiliais = () => api.get('/empresa/all');

// Função para buscar todas as permissões disponíveis
export const fetchPermissions = () => api.get('/painelpermissoes/all');

// Função para buscar permissões de um usuário em uma filial específica
export const fetchUserPermissions = (usuarioId, filialId) => 
    api.get(`/painelpermissoes/usuario/${usuarioId}/filial/${filialId}`);

// Função para atribuir uma permissão a um usuário em uma filial
export const assignPermissionToUser = (usuarioId, filialId, permissionId) => 
    api.post('/painelpermissoes/add', {
        usuarioId,
        filialId,
        permissionId
    });

// Função para remover uma permissão de um usuário em uma filial
export const removePermissionFromUser = (usuarioId, filialId, permissionId) => 
    api.delete(`/painelpermissoes/${permissionId}`, {
        data: { usuarioId, filialId }
    });

// Função para buscar usuários de uma filial específica
export const fetchUsersByFilialId = (filialId) => api.get(`/usuario/filial/${filialId}`);

// Função para buscar todos os usuários
export const fetchAllUsers = () => api.get('/usuario/all');

// Função para adicionar um usuário a uma filial
export const addUserToBranch = (filialId, usuarioId) => 
    api.post('/painelpermissoes/add', { filialId, usuarioId });

// Função para remover um usuário de uma filial
export const removeUserFromBranch = (painelPermissoesId) => 
    api.delete(`/painelpermissoes/${painelPermissoesId}`);

// Função para buscar uma Pessoa por ID
export const fetchPessoaById = (pessoaId) => api.get(`/pessoa/${pessoaId}`);

// Função para buscar um Funcionario por ID
export const fetchFuncionarioById = (funcionarioId) => api.get(`/funcionario/${funcionarioId}`);