import { GetServerSideProps } from 'next';
import { FormEvent, useContext, useState } from 'react'
import { parseCookies } from 'nookies';
import { AuthContext } from '../context/AuthContext';
import styles from '../styles/Home.module.css'

export default function Home() {
  const [email,setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn } = useContext(AuthContext);

  async function handleSubmit(event: FormEvent){
    event.preventDefault();

    const data = {
      email,
      password
    };

    await signIn(data);
    console.log(data);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)}></input>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)}></input>
      <button type="submit">Entrar</button>
    </form>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = parseCookies(ctx);

  if(cookies['authrocket.token']){
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      }
    }
  }
  
  return {
    props:{}
  }
}
