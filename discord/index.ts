require('dotenv').config();
import Discord, { CollectorFilter } from "discord.js";
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
  if (msg.content === 'start') {
    const size = 3;
    // TODO filter func
    const msgs = (await msg.channel.messages.fetch()).filter((m) => m.content != "start").map((m) => m.content)
    shuffle(msgs);
    const diff = msgs.length - (size ** 2);
    if (diff > 0) msgs.splice(-diff, diff);
    const participateMsg = await msg.reply("Please react to ✅ to participate in lockout");
    await participateMsg.react("✅");
    let timerCountdown = 10;
    let timerRef = setInterval(async () => {
      timerCountdown--;
      await participateMsg.edit(`Please react to ✅ to participate in lockout (Finishes in ${timerCountdown})`)
    }, 1000)
    const msgReactions = await participateMsg.awaitReactions(reactionFilter, { max: 4, time: 10000 });
    clearInterval(timerRef);
    let usersPing = "";
    console.log(msgReactions.size);
    if (msgReactions.size == 0) {
      msg.channel.send("didnt react fast enough noone attended");
      return;
    }
    (await msgReactions.first().users.fetch()).filter(u => !u.bot).forEach(u => usersPing += u.toString() + " ")
    await participateMsg.edit(`Times up! these are the contestants: ${usersPing}`);
    await msg.channel.send(usersPing);
    const dbObject = { participants: [1, 2], data: msgs, channelId: msg.channel.id, size: 3 };
    console.log({ dbObject })
    await db.collection("games").insertOne(dbObject);

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