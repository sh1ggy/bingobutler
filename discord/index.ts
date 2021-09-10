require('dotenv').config();
import Discord from "discord.js";
import { db } from '../lib/db';

const client = new Discord.Client();

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
    const msgs = [...msg.channel.messages.cache.values()]
    const newmsg = (await msg.channel.messages.fetch()).map((m)=> m.content)
    // console.log(msgs);
    // msg.channel.messages.cache.forEach((val)=> {
    //   console.log(val);
    // })

    const dbObject = {participants: [1, 2], data: newmsg, channelId: msg.channel.id };
    console.log({dbObject})
   await db.collection("games").insertOne(dbObject);
  }
  if (msg.content ==="clear") {
    const msgs =  msg.channel.messages.cache.forEach(m=> m.delete());
  }
})

client.login(process.env.TOKEN)