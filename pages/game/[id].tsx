import type { NextPage } from 'next'
import Image from 'next/image'
import styles from '../../styles/Bingo.module.css'
import { connectToDatabase } from '../../lib/db'
import { ObjectId } from 'mongodb'
import { useEffect, useRef, useState } from 'react'
import socket from 'socket.io-client';
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/dist/client/router'

const URL = "http://localhost:3001";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // const res = await fetch(`https://bb.kongroo.xyz/${bingo}`);
  // const data = await res.json;
  const { db } = await connectToDatabase();
  const game = await db
    .collection("games")
    .findOne({ _id: new ObjectId(ctx.params.id.toString()) })


  game._id = game._id.toHexString();
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
  const router = useRouter();
  const [user, setUser] = useState(null);
  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (!localUser) {
      localStorage.setItem("bookmark", game._id);
      const loginURL = 'http://localhost:3001/login'
      router.push(loginURL);
      return;
    }
    setUser(JSON.parse(localUser));

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
    io.current.emit('done', { rt: user.rt, index })
    return;
  }

  return (
    <div className="container">
      <main className={styles.main}>
        <h1 className={styles.title}>
          Bingo!
        </h1>
        <table className={`table-dark ${styles.thc} ${styles.table} col-12`}>
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
    </div>
  )
}

export default Home
