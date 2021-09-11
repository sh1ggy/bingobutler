require('dotenv').config();
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io'
import cors from 'cors';
// import fetch from 'node-fetch';
// const fetch = require('node-fetch');
const axios = require('axios').default;
const app = express();
const http = createServer(app);
const io = new Server(http, {
  cors: { origin: "*", }
});
app.use(cors());

const callback_url = 'http://127.0.0.1:3001/auth/callback'


io.on("connection", (socket) => {
  console.log('a user connected');
  socket.on('done', ({ rt, index }) => {
    console.log({ rt, index });
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
  try {
    const result = await axios.post(url, params, options);
    console.log(result.data);

  } catch (error) {
    console.log(error.message);
  }
  res.send("Done")
})

const PORT = process.env.PORT || 3001;
http.listen(PORT);