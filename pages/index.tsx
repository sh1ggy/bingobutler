import type { NextPage } from 'next'
import Image from 'next/image'
import styles from '../styles/Bingo.module.css'
import { connectToDatabase } from '../lib/db'
import { ObjectId } from 'mongodb'
import { useEffect, useRef, useState } from 'react'
import socket from 'socket.io-client';

const URL = "http://localhost:3001";


export async function getServerSideProps(context: any) {
  // const res = await fetch(`https://bb.kongroo.xyz/${bingo}`);
  // const data = await res.json;
  const { db } = await connectToDatabase();

  const games = await db
    .collection("games")
    .find({})
    .toArray();

  const game = games[0];
  game._id = new ObjectId(game._id).toHexString();
  console.log(game);
  const gameSize = 3;
  var multiGame = [];
  for (let i = 0; i < gameSize; i++) {
    var innerArray = [];
    for (let j = 0; j < gameSize; j++) {
      var index = i * gameSize + j;
      innerArray.push(game.data[index]);
      // console.log(i, j, game.data[j]);
    }
    multiGame.push(innerArray);
  }

  return {
    props: { multiGame, game },
  }
}



//@ts-ignore
const Home: NextPage = ({ multiGame, game }) => {
  const [completed, setCompleted] = useState([]);
  const io = useRef(null);

  useEffect(() => {
    // handling socket TODO in room
    io.current = socket(URL);
    io.current.on('doneSync', (data) => {
      console.log(data)
    })

    let tempCompleted = [];
    for (let i = 0; i < game.data.length; i++) {
      tempCompleted.push(false);
    }
    setCompleted(tempCompleted);
  }, []);
  console.log(completed);

  function onLock(index) {
    let tempCompleted = [...completed];
    tempCompleted[index] = !tempCompleted[index];
    setCompleted(tempCompleted)
    console.log(completed);
    io.current.emit('done', { rt: "sup", index })
    return;
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Bingo! {game.participants}
        </h1>
        <table className={`table-dark ${styles.thc} ${styles.table}`}>
          <tbody>
            {multiGame.map((row, rowIndex) => (
              <tr>
                {row.map((cell, index) => (
                  <td className={`col-12 col-lg-4 ${completed[rowIndex * game.size + index] ? styles.clicked : styles.unclicked}`} onClick={() => onLock(rowIndex * game.size + index)}>
                    <p className={styles.unselectable}>{cell}</p>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      <footer className={styles.footer}>
        <p>kongi</p>
      </footer>
    </div>
  )
}

export default Home
