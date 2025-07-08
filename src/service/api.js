import axios from 'axios';

//const ip = '10.84.211.78';
//const ip = '192.168.110.78';
const ip = 'localhost';
export const api = axios.create({
    baseURL: `http://${ip}:8081/`,
});
