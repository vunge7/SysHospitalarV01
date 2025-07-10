import axios from 'axios';

<<<<<<< HEAD

//const ip = '192.168.110.78';
const ip = 'localhost';
//const ip = '10.59.24.78';
//const ip = '192.168.110.78';

export const api = axios.create({
    baseURL: `https://${ip}:8081/`,
});
=======
 
//const ip = '10.84.211.78';
//const ip = '10.59.24.78';
//const ip = '192.168.110.78';
 
 
const ip = 'localhost';
//const ip = '10.103.131.78';
 
export const api = axios.create({
    baseURL: `http://${ip}:8081/`,
});
>>>>>>> a6b70d3 (Alteraçoes)
