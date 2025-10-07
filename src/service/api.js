import axios from 'axios';

<<<<<<< HEAD
const ip = ' 192.168.8.198';
=======
//const ip = '10.187.230.78';

const ip = 'localhost';
>>>>>>> 5f370fa149c09235cd69adb61018f5bbe037183f

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
