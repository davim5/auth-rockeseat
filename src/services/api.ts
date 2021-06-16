import axios, {AxiosError} from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../context/AuthContext';

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestsQueue: { onSuccess: (token: string) => void; onFailure: (err: AxiosError<any>) => void; }[] = [];

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

            const originalConfig = error.config;

            if(!isRefreshing){
                isRefreshing = true;

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

                    failedRequestsQueue.forEach(request => request.onSuccess(token));
                    failedRequestsQueue = [];
                }).catch(err => {
                    failedRequestsQueue.forEach(request => request.onFailure(err));
                    failedRequestsQueue = [];
                }).finally(()=>{
                    isRefreshing = false;
                });
            }

            return new Promise((resolve, reject) => {
                failedRequestsQueue.push({
                    onSuccess: (token:string) => {
                        originalConfig.headers['Authorization'] = `Bearer ${token}`;

                        resolve(api(originalConfig));
                    },
                    onFailure: (err: AxiosError) => {
                        reject(err);
                    },
                })
            });
        } else {
            // deslogar usuário
            if(error.response.status === 401) {
                signOut();
            }
        }

    }
    return Promise.reject(error);
})