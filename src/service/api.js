import axios from 'axios';

const ip = 'localhost';
//const ip = '192.168.110.78';
export const api = axios.create({
    baseURL: `http://${ip}:8081/`,
});
