import axios from 'axios';

<<<<<<< HEAD

//const ip = '192.168.110.78';
const ip = 'localhost';
=======
const ip = 'localhost';
//const ip = '10.59.24.78';
//const ip = '192.168.110.78';
>>>>>>> 5cbe29d7cf1836e75174cb846ac525a73f808f87
export const api = axios.create({
    baseURL: `http://${ip}:8081/`,
});
