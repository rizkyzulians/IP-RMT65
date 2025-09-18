import axios from 'axios';

export const serverSide = axios.create({
    baseURL: "http://localhost:3000",
});