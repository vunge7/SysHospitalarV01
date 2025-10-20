import axios from 'axios';

//const ip = 'localhost';

const ip = 'api-ywq2.onrender.com';

export const api = axios.create({
    baseURL: `https://${ip}/`,
    withCredentials: true, // Adiciona suporte a credenciais
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

// Função para buscar filiais associadas a um usuário
export const fetchFiliaisByUsuarioId = (usuarioId) => api.get(`/painelpermissoes/usuario/${usuarioId}/filiais`);

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
export const fetchUsersByFilialId = (filialId) => api.get(`/usuarios/filial/${filialId}`);
