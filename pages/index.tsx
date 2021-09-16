import type { GetServerSideProps, NextPage } from 'next'
import { SERVER_URL } from '../lib/constants';
import { connectToDatabase } from '../lib/db';
import styles from '../styles/Home.module.css'


export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const serverDataReq = await fetch(SERVER_URL + '/serverInfo');
  let serverData = null;
  if (serverDataReq.ok) {
    serverData = await serverDataReq.json();
  }
  return {
    props: { serverData }
  }
}

//@ts-ignore
const Home: NextPage = ({ serverData }) => {
  
  return (
    <div className="container">
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Bingo Butler!

        </h1>
        {
          !!serverData ? 
          <h2>We are in use by {serverData.serverCount}</h2> : 
          <h2>The bot and api are likely down right now :(</h2>
        }
      </main>
      Invite our bot:
<a>https://discord.com/oauth2/authorize?client_id=885845871105806386&permissions=0&scope=bot%20applications.commands</a>

    </div>
  )
}

export default Home
