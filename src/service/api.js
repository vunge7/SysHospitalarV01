import axios from 'axios';

//const ip = '192.168.110.78';
const ip = '10.56.133.78';
//const ip = '10.59.24.78';
//const ip = '192.168.110.78';

export const api = axios.create({
    baseURL: `http://${ip}:8081/`,
});
