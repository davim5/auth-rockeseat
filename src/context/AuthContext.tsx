import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";
import Router from "next/router";
import { setCookie, parseCookies, destroyCookie } from "nookies";

type User = {
    email: string;
    permissions: string[];
    roles: string[];
}

type SignInCredentials = {
    email: string;
    password: string;
}

type AuthContextData = {
    signIn(credentials: SignInCredentials): Promise<void>;
    isAuthenticated: boolean;
    user?: User;
};

type AuthProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData)

export function signOut(){
    destroyCookie(undefined,'authrocket.token');
    destroyCookie(undefined,'authrocket.refreshToken');
    Router.push('/');
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User>();
    const isAuthenticated = !!user;

    useEffect(() =>{
        const { 'authrocket.token': token } = parseCookies();

        if(token) {
            api.get('/me').then( response => {
                const { email, permissions, roles } = response.data;

                setUser({ email, permissions, roles })
            })
            .catch(() => {
                signOut();
            })
        };

    },[])

    async function signIn({ email, password }: SignInCredentials) {

        try {

            const response = await api.post('sessions', {
                email,
                password,
            });
            
            const { token, refreshToken, permissions, roles } = response.data;

            // sessionStorage -> só durante durante a sessão
            // localStorage -> Backend não tem acesso
            // cookies -> Mil maravilhas

            setCookie(undefined, 'authrocket.token', token,{
                maxAge: 60 * 60 * 24 * 30,
                path: '/',
            });

            setCookie(undefined, 'authrocket.refreshToken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30,
                path: '/',
            });

            setUser({
                email,
                permissions,
                roles
            });

            api.defaults.headers['Authorization'] = `Bearer ${token}`;

            Router.push('/dashboard')
        } catch(err) {
            console.log(err)
        }
    }


    return (
        <AuthContext.Provider value={{signIn, isAuthenticated, user}}>
            {children}
        </AuthContext.Provider>
    )
}