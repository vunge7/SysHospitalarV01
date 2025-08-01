import axios from 'axios';

//const ip = '192.168.110.78';
const ip = '10.211.60.78';
//const ip = '10.59.24.78';
//const ip = '192.168.110.78';

export const api = axios.create({
    baseURL: `https://${ip}:8081/`,
});
