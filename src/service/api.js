import axios from 'axios';

const ip = '10.187.230.78';

export const api = axios.create({
    baseURL: `http://${ip}:8081/`,
});
