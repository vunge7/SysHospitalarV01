import axios from 'axios';

//const ip = '10.84.211.78';
//const ip = '10.59.24.78';
//const ip = '192.168.110.78';
const ip = '10.59.24.212';
export const api = axios.create({
    baseURL: `https://${ip}:8081/`,
});
