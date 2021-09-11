require('dotenv').config();
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io'
import cors from 'cors';
import { connectToDatabase } from '../lib/db';
import { Db, MongoDBNamespace, ObjectId } from 'mongodb';
const axios = require('axios').default;
const app = express();
const http = createServer(app);
const io = new Server(http, {
  cors: { origin: "*", }
});
app.use(cors());
let db: Db;
const callback_url = 'http://127.0.0.1:3001/auth/callback'

io.on("connection", (socket) => {
  console.log('a user connected');
  socket.on('done', async ({ rt, index, gameId }) => {
    console.log({ rt, index, gameId });
    const user = await db.collection("users").findOne({rt});
    const game = await db.collection("game").findOneAndUpdate(
      { _id: new ObjectId(gameId), state : {$elemMatch : index}},
      { $set: {'state.$' : user.id} },
      // {`state.$[index]`: user.id }
    );
    console.log(user);
    console.log(game);
    socket.emit('doneSync', { message: "hey" })
  })
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.get('/login', (req, res) => {
  return res.redirect(
    'https://discordapp.com/api/oauth2/authorize' +
    '?client_id=' + process.env.CLIENT_ID +
    '&redirect_uri=' +
    encodeURIComponent(callback_url) +
    '&response_type=code' +
    '&scope=identify%20email'
  );
})

app.get('/auth/callback', async (req, res) => {
  let code = req.query.code;
  console.log(code);
  const params = new URLSearchParams();
  params.append("client_id", process.env.CLIENT_ID)
  params.append("client_secret", process.env.CLIENT_SECRET)
  params.append("grant_type", 'authorization_code')
  params.append("redirect_uri", callback_url)
  params.append("scope", 'identify email')
  params.append("code", code.toString())

  // const body = {
  //   client_id: process.env.CLIENT_ID,
  //   client_secret: process.env.CLIENT_SECRET,
  //   grant_type: 'authorization_code',
  //   redirect_uri: callback_url,
  //   scope: 'identify email',
  //   code
  // }
  // console.log(body)
  const url = 'https://discordapp.com/api/v8/oauth2/token';
  const options = {
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
  }
  let data;
  try {
    const result = await axios.post(url, params, options);
    console.log(result.data);
    // a = result.data.access_token;
    // rt = result.data.refresh_token;
    data = result.data;
  } catch (error) {
    console.log(error.message);
    res.status(400);
    return res.send(error.message);
  }

  const resourceURL = 'https://discordapp.com/api/v8/users/@me'
  const resOptions = {
    headers: {
      Authorization: 'Bearer ' + data.access_token
    },
  }
  let user = await axios.get(resourceURL, resOptions)
  console.log(user.data)
  const payload = { ...user.data, rt: data.refresh_token }

  // res.send(JSON.stringify(payload));
  await db.collection("users").insertOne(payload);

  const backToLoginURL = 'http://localhost:3000/auth?rt=' + data.refresh_token;
  // db, localstorage, websockets
  res.redirect(backToLoginURL);
})

const PORT = process.env.PORT || 3001;
http.listen(PORT, async () => {
  db = await (await connectToDatabase()).db;
});