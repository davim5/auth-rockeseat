import { destroyCookie } from "nookies";
import { useContext, useEffect } from "react"
import { AuthContext } from "../context/AuthContext"
import { Can } from "../components/Can";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard(){

    const { user } = useContext(AuthContext);

    useEffect(() =>{
        api.get('/me')
        .then(response => console.log(response))
    },[])

    return(
        <>
            <h1>Dashboard: {user?.email} </h1>
            <Can permissions={['metrics.list']}>
                <div>Metricas</div>
            </Can>
        </>
    )
}

export const getServerSideProps = withSSRAuth( async (ctx) => {
    
    const apiClient = setupAPIClient(ctx);

    const response = await apiClient.get('/me');
    
    console.log(response.data);

    return {
        props:{}
    }
})