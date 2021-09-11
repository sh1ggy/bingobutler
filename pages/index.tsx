import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
const URL = "http://localhost:3001";


//@ts-ignore
const Home: NextPage = ({ }) => {
  return (
    <div className="container">
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Bingo Butler!
        </h1>
      </main>

      
    </div>
  )
}

export default Home
