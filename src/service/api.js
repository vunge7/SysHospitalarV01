import axios from 'axios';

//const ip = '10.84.211.78';
<<<<<<< HEAD
//const ip = '192.168.110.78';
const ip = 'localhost';
=======
//const ip = '10.59.24.78';
//const ip = '192.168.110.78';
const ip = '10.59.24.78';
>>>>>>> 9263aaf49f5b23220f2b10fbd179787dfaf8ce34
export const api = axios.create({
    baseURL: `http://${ip}:8081/`,
});
