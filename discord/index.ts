require('dotenv').config();
import Discord, { CollectorFilter, Message } from "discord.js";
import { Db } from "mongodb";
import { connectToDatabase } from '../lib/db';


//TODO
//https://medium.com/@markcolling/integrating-socket-io-with-next-js-33c4c435065e

const client = new Discord.Client();
let db: Db;


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
    const participantWaitTimer = 3;
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
    shuffle(msgs);
    const diff = msgs.length - (size ** 2);
    if (diff > 0) msgs.splice(-diff, diff);
    let participantWaitCountdown = participantWaitTimer;

    const participateMsg = await msg.channel.send(`Please react to ✅ to participate in lockout`);
    await participateMsg.react("✅");
    let timerRef = setInterval(async () => {
      participantWaitCountdown--;
      await participateMsg.edit(`Please react to ✅ to participate in lockout (Finishes in ${participantWaitCountdown})`)
    }, participantWaitCountdown*1000)
    const msgReactions = await participateMsg.awaitReactions(reactionFilter, { max: 4, time: participantWaitCountdown*1000 });
    clearInterval(timerRef);
    let usersPing = "";
    console.log(msgReactions.size);

    if (msgReactions.size == 0) {
      await participateMsg.edit("No one is attending! Clearing messages...");
      await participateMsg.reactions.removeAll();
      let deleteCountdown = deleteWaitTimer;

      timerRef = setInterval(async () => {
        deleteCountdown--;
        await participateMsg.delete();
        await msg.delete();
      }, deleteCountdown*1000)
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
      stateArrayInit.push(0);
    }
    const dbObject = { participants: participants.map(u => u.id), data: msgs, channelId: msg.channel.id, size: size, state: stateArrayInit };
    console.log({ dbObject });
    const gameId = (await db.collection("games").insertOne(dbObject)).insertedId.toHexString();
    console.log(gameId);
    
    const gameUrl = `http://bb.kongroo.xyz/game/${gameId}`;
    await msg.channel.send(`Times up! these are the contestants: ${usersPing}.\nAccess the game board here: ${gameUrl}`);
  }
  if (msg.content === "clear") {
    const msgs = (await msg.channel.messages.fetch()).forEach(m => m.delete());
  }
  if (msg.content === "hydrate") {

  }
})

async function main() {

  db = await (await connectToDatabase()).db;
  await client.login(process.env.TOKEN);

}
main();