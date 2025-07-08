import axios from 'axios';

<<<<<<< HEAD
//const ip = '10.84.211.78';
//const ip = '10.59.24.78';
//const ip = '192.168.110.78';
//const ip = '10.59.24.78';
const ip = 'localhost';

=======
<<<<<<< HEAD

//const ip = '192.168.110.78';
const ip = 'localhost';
=======
const ip = 'localhost';
//const ip = '10.59.24.78';
//const ip = '192.168.110.78';
>>>>>>> 5cbe29d7cf1836e75174cb846ac525a73f808f87
>>>>>>> 9331a831d2ccb160a9d8ab2705b8a48180546383
export const api = axios.create({
    baseURL: `http://${ip}:8081/`,
});