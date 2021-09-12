require('dotenv').config();
import Discord, { CollectorFilter, Message } from "discord.js";
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

const client = new Discord.Client();
// let db: Db;

export const reactionFilter: CollectorFilter = (reaction, user) => {
  return ["✅"].includes(reaction.emoji.name);
};

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
})

function shuffle(arr: string[]) {
  let currentIndex = arr.length;
  while (currentIndex != 0) {
    const randIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    const temp1 = arr[randIndex];
    const temp2 = arr[currentIndex];
    arr[currentIndex] = temp1;
    arr[randIndex] = temp2;
    // [arr[currentIndex], arr[randIndex]] = [arr[randIndex], arr[currentIndex]];
  }
}

client.on('message', async msg => {
  if (msg.channel.type == 'dm') return;
  if (msg.channel.type == "news") return;
  if (msg.author.bot) return;
  if (msg.content === 'ping') {
    msg.reply('pong');
  }
  if (msg.content.startsWith('start')) {
    const participantWaitTimer = 10;
    const deleteWaitTimer = 3;
    const msgSize = 3;
    let size = msgSize;
    // TODO filter func
    const messageFilter = (m: Message) => {
      if (m.content.startsWith("start")) return false;
      if (m.author.bot) return false;
      return true;
    }
    const msgs = (await msg.channel.messages.fetch()).filter(messageFilter).map((m) => m.content)
    if (msgs.length < Math.pow(size, 2)) {
      await msg.channel.send(`Not enough bingo terms`);
      return;
    }
    shuffle(msgs);
    const diff = msgs.length - (size ** 2);
    if (diff > 0) msgs.splice(-diff, diff);
    let participantWaitCountdown = participantWaitTimer;
    const participateMsg = await msg.channel.send(`Please react to ✅ to participate in lockout`);
    await participateMsg.react("✅");
    let timerRef = setInterval(async () => {
      participantWaitCountdown--;
      await participateMsg.edit(`Please react to ✅ to participate in lockout (Finishes in ${participantWaitCountdown})`)
    }, participantWaitCountdown * 1000)
    const msgReactions = await participateMsg.awaitReactions(reactionFilter, { max: 4, time: participantWaitCountdown * 1000 });
    await msg.delete();
    clearInterval(timerRef);
    let usersPing = "";
    console.log(msgReactions.size);

    if (msgReactions.size == 0) {
      await participateMsg.edit("No one attended! Clearing messages...");
      await participateMsg.reactions.removeAll();
      let deleteCountdown = deleteWaitTimer;

      timerRef = setTimeout(async () => {
        await participateMsg.delete();
      }, deleteCountdown * 1000)
      return;
    }
    let participants = (await msgReactions.first().users.fetch()).filter(u => !u.bot);
    participants.forEach(u => usersPing += u.toString() + " ")

    await participateMsg.delete();

    let split = msg.content.split(" ");
    if (split.length == 2) {
      size = parseInt(split[1]);
    }
    const stateArrayInit = [];
    for (let i = 0; i < msgs.length; i++) {
      stateArrayInit.push(-1);
    }

    const hueRange = 360 / participants.size;
    let pInd = 0;
    const participantsPayload = participants.map((u) => {

      const hsl = {
        h: Math.random() * hueRange + pInd * hueRange,
        s: 0.4,
        l: 0.6
      }
      pInd++;
      return {
        hsl,
        id: u.id,
        username: u.username
      }
    })

    const dbObject = {
      participants: participantsPayload,
      data: msgs,
      channelId: msg.channel.id,
      size: size,
      state: stateArrayInit
    };
    const gameId = (await db.collection("games").insertOne(dbObject)).insertedId.toHexString();
    console.log(gameId);
    const gameUrl = `http://localhost:3000/game/${gameId}`;


    const masterMsg = await msg.channel.send(`Times up! these are the contestants: ${usersPing}.\nAccess the game board here: ${gameUrl}`);

    await db.collection("games").findOneAndUpdate(
      { _id: new ObjectId(gameId) },
      { $set: { masterMsgId: masterMsg.id, masterMsgChId: masterMsg.channel.id } },
    );

  }
  if (msg.content === "clear") {
    const msgs = (await msg.channel.messages.fetch()).forEach(m => m.delete());
  }
})

io.on("connection", (socket) => {
  console.log('a user connected');

  socket.on('done', async ({ rt, index, gameId }) => {
    const user = await db.collection("users").findOne({ rt });
    // Unconventional method of editing array, relational and other forms dictate this needs to be [{ind: 0, val:0}.....]
    // Access array & do checks & TODO: replace full array instead 
    const access = 'state.' + index;
    const { value: game } = await db.collection("games").findOneAndUpdate(
      { _id: new ObjectId(gameId) },
      { $set: { [access]: user.id } },
      { returnDocument: 'after' }
    );
    if (!game) return;
    if (!game.participants.includes(user.id)) return;


    const participantSums = game.participants.reduce((acc, val) => {
      acc[val.id] = 0;
      return acc;
    }, {});

    for (let i = 0; i < game.state.length; i++) {
      if (game.state[i] == -1) continue;
      Object.keys(participantSums).forEach((pKey) => {
        if (game.state[i] == pKey) {
          participantSums[pKey]++;
        }
      })
    }

    const winCon = Math.ceil(game.state.length / game.participants.length)
    console.log({ winCon, participantSums });

    for (const [key, value] of Object.entries(participantSums)) {
      if (value >= winCon) {
        console.log(`${key} has won`);
        const winChannel = (await client.channels.fetch(game.masterMsgChId)) as Discord.TextChannel;
        const masterMsg = await winChannel.messages.fetch(game.masterMsgId);
        const winner = await client.users.fetch(key);
        await winChannel.send(`${winner.toString()} has won`)
        masterMsg.delete();
        await db.collection("games").findOneAndDelete({
          _id: new ObjectId(gameId)
        })
        io.emit('gameDone', { winner: game.participants.find((p) => p.id == key) });

      }
    }

    io.emit('sync', { state: game.state },)
  })

  socket.on('undo', async ({ rt, index, gameId }) => {
    const user = await db.collection("users").findOne({ rt });
    // Unconventional method of editing array, relational and other forms dictate this needs to be [{ind: 0, val:0}.....]
    const access = 'state.' + index;
    const { value: game } = await db.collection("games").findOneAndUpdate(
      { _id: new ObjectId(gameId) },
      { $set: { [access]: -1 } },
      { returnDocument: 'after' }
    );
    io.emit('sync', { state: game.state })
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
  const params = new URLSearchParams();
  params.append("client_id", process.env.CLIENT_ID)
  params.append("client_secret", process.env.CLIENT_SECRET)
  params.append("grant_type", 'authorization_code')
  params.append("redirect_uri", callback_url)
  params.append("scope", 'identify email')
  params.append("code", code.toString())

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
  const payload = { ...user.data, rt: data.refresh_token }

  await db.collection("users").findOneAndReplace(
    { id: payload.id },
    payload,
    { upsert: true }
  )
  // await db.collection("users").insertOne(payload);

  const backToLoginURL = 'http://localhost:3000/auth?rt=' + data.refresh_token;
  res.redirect(backToLoginURL);
})

const PORT = process.env.PORT || 3001;

async function main() {
  db = await (await connectToDatabase()).db;
  await client.login(process.env.TOKEN);
  await http.listen(PORT);
}

main();