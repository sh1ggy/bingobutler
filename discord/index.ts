require('dotenv').config();
import Discord from "discord.js";
import { Db } from "mongodb";
import { connectToDatabase } from '../lib/db';

const client = new Discord.Client();
let db: Db;


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

})

client.on('message', async msg => {
  if (msg.channel.type == 'dm') return;
  if (msg.channel.type == "news") return;
  if (msg.author.bot) return;
  if (msg.content === 'ping') {
    msg.reply('pong');
  }
  if (msg.content === 'start') {
    // TODO filter func

    // const msgs =  msg.channel.messages.cache.filter((m)=> m.content!="start").map((m)=> m.content);
    // const msgs = [...msg.channel.messages.cache.values()]
    const msgs = (await msg.channel.messages.fetch()).filter((m) => m.content != "start").map((m) => m.content)


    const dbObject = { participants: [1, 2], data: msgs, channelId: msg.channel.id, rows: 3 };
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
