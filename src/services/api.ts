import axios, {AxiosError} from 'axios';
import { parseCookies, setCookie } from 'nookies';

let cookies = parseCookies();

export const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
        Authorization: `Bearer ${cookies['authrocket.token']}`
    }
});

api.interceptors.response.use(response => {
    return response;
}, (error: AxiosError) => {
    if(error.response?.status === 401) {
        if(error.response.data?.code === 'token.expired') {
            // renovar o token
            cookies = parseCookies(); 

            const { 'authrocket.refreshToken': refreshToken } = cookies;

            api.post('/refresh', {
                refreshToken,
            }).then( response => {
                const { token } = response.data;

                setCookie(undefined, 'authrocket.token', token,{
                    maxAge: 60 * 60 * 24 * 30,
                    path: '/',
                });
    
                setCookie(undefined, 'authrocket.refreshToken', response.data.refreshToken, {
                    maxAge: 60 * 60 * 24 * 30,
                    path: '/',
                });

                api.defaults.headers['Authorization'] = `Bearer ${token}`;
            });
        } else {
            // deslogar usuário
        }
    }
})