import axios from 'axios';

const ip = ' 192.168.8.198';

export const api = axios.create({
    baseURL: `http://${ip}:8081/`,
});
