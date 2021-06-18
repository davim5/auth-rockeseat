import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenError";


export function withSSRAuth<P>(fn: GetServerSideProps<P>){

    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
        const cookies = parseCookies(ctx);

        if(!cookies['authrocket.token']){
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                }
            }
        }

        try {
            return await fn(ctx);
        } catch(err) {
            if(err instanceof AuthTokenError){
                destroyCookie(ctx,'authrocket.token');
                destroyCookie(ctx,'authrocket.refreshToken');
        
                return {
                    redirect: {
                        destination: '/',
                        permanent: false,
                    }
                }
            }
        }
    }
}