import type { NextPage } from 'next'
import Image from 'next/image'
import styles from '../../styles/Bingo.module.css'
import { connectToDatabase } from '../../lib/db'
import { ListCollectionsCursor, ObjectId } from 'mongodb'
import { useContext, useEffect, useRef, useState } from 'react'
import socket from 'socket.io-client';
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/dist/client/router'
import { UserContext } from '../_app'
import { User } from 'discord.js'

const URL = "http://localhost:3001";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // const res = await fetch(`https://bb.kongroo.xyz/${bingo}`);
  // const data = await res.json;
  const { db } = await connectToDatabase();
  const game = await db
    .collection("games")
    .findOne({ _id: new ObjectId(ctx.params.id.toString()) })
  if (!game) return {notFound: true}
  console.log(game);
  game._id = game._id.toHexString();
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
  const [gameWinner, setGameWinner] = useState<any>(false);
  const io = useRef(null);
  const router = useRouter();
  const { user, setUser } = useContext(UserContext);
  
  useEffect(() => {
    setCompleted(game.state);
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
    io.current.on('sync', (data) => {
      setCompleted(data.state);
      console.log(data)
    })

    io.current.on('gameDone', (data) => {
      setGameWinner(data.winner);
    })
  }, []);

  function onLock(index) {

    console.log(completed);
    if (user.id == completed[index]) {
      io.current.emit('undo', { rt: user.rt, index, gameId: game._id });
      return;
    }
    if (completed[index] !=-1) return;
    io.current.emit('done', { rt: user.rt, index, gameId: game._id });
  }
  let userColor = '';
  if (!user) {userColor = 'teal'}
  else {
    const participant = game.participants.find((participant) => user.id == participant.id);
    userColor = `hsl(${participant.hsl.h}, ${Math.floor(participant.hsl.s * 100)}%, ${Math.floor(participant.hsl.l * 100)}%)` 
  }


  return (
    <div className={styles.container} style={{backgroundColor: userColor}}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Bingo Butler
        </h1>
        <h2>
          {gameWinner && `${gameWinner.username} has won`}
        </h2>  
        <table className={`table-dark ${styles.table} ${styles.thc} table-centered col-12`}>
          <tbody>
            {multiGame.map((row, rowIndex) => (
              <tr>
                {row.map((cell, index) => {
                  let color = "teal";
                  const flatIndex = rowIndex * game.size + index;
                  if (completed.length != 0) {
                    // console.log({game, completed});
                    const userId = completed[flatIndex];
                    if (userId != -1) {
                      const user = game.participants.find((user) => userId == user.id);
                      color = `hsl(${user.hsl.h}, ${Math.floor(user.hsl.s * 100)}%, ${Math.floor(user.hsl.l * 100)}%)` 
                      // console.log({user, userId, color})
                    } 
                  } 
                  return (
                    //className={`${completed[rowIndex * game.size + index] != -1 ? styles.clicked : styles.unclicked}`}
                    <td style={{backgroundColor: color}} onClick={() => onLock(flatIndex)}>
                      <p className={styles.unselectable}>{cell}</p>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{backgroundColor: 'red'}}>
          
        </div>

      </main>
    </div>
  )
}

export default Home
