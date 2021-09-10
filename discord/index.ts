require('dotenv').config();
import Discord from "discord.js";
// @ts-ignore
const client = new Discord.Client({intents: "GUILDS"});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

})

client.on('message', async msg => {
  // if (msg.channel.type == 'dm') return;
  console.log(msg.content);
  if (msg.content === 'ping') {
    msg.reply('pong');
  }
})

client.login(process.env.TOKEN)