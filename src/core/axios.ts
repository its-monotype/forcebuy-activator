import axios from 'axios';

const Axios = axios.create({
  baseURL: 'https://api.forcebuy.ru/api/',
});

export default Axios;
