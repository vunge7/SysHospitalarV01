import axios from 'axios';

//const ip = '192.168.110.78';
<<<<<<< HEAD
const ip = 'localhost';
=======
const ip = '10.211.60.78';
>>>>>>> 0c573dd32fd3da4bc6cf9e4ad8ff949cfbfafab3
//const ip = '10.59.24.78';

export const api = axios.create({
    baseURL: `http://${ip}:8081/`,
});
