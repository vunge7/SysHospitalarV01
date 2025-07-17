import axios from 'axios';

<<<<<<< HEAD
const ip = "localhost";
=======
//const ip = '192.168.110.78';
const ip = 'localhost';
//const ip = '10.59.24.78';
//const ip = '192.168.110.78';
>>>>>>> 3f032e161ed05315ed3cba52f969af9ec72f807e

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