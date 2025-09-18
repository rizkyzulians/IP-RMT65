import axios from 'axios';

export const serverSide = axios.create({
    baseURL: "https://la-cusina-app.mrizky.web.id",
});