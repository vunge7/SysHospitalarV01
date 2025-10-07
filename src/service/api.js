import axios from 'axios';

const ip = '10.187.230.78';

export const api = axios.create({
    baseURL: `http://${ip}:8081/`,
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