import type { GetServerSideProps, NextPage } from 'next'
import { connectToDatabase } from '../lib/db';
import styles from '../styles/Home.module.css'
const URL = "http://localhost:3001";

import { client } from '../api/index';

// export const getServerSideProps: GetServerSideProps = async (ctx) => {
//   // const usedBy = client.guilds.cache.size;
//   return {
//     props: { usedBy }
//   }
// }

//@ts-ignore
const Home: NextPage = ({usedBy }) => {
  return (
    <div className="container">
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Bingo Butler!

        </h1>
        <h2>We are in use by {usedBy}</h2>
      </main>


    </div>
  )
}

export default Home
