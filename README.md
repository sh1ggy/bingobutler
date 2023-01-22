# Bingo Butler Discord Bot

![kongi](https://img.shields.io/badge/kongi-purple?style=plastic) ![Year](https://img.shields.io/badge/Year-2021-red?style=plastic) ![Language](https://img.shields.io/badge/TypeScript-grey?style=plastic&logo=typescript) ![Framework](https://img.shields.io/badge/NextJS-grey?style=plastic&logo=next.js)

This is a Discord bot made as a part of the [**UQCS 2021 Hackathon**](https://uqcs.org/competitions/hackathon-2021/) for the intended purpose of facilitating speedrun bingo wherein both players will get a randomly generated bingo board based on challenges that they must complete in the speedrun. Bingo Butler aims to upon [Bingosync](https://bingosync.com/)'s workflow by making it quicker via instanced rooms and easily customisable inputs localised within a Discord text channel. 

Currently this bot only supports for games of lockout rather than bingo as it suited the time requirements of the hackathon. 

This bot is running on Vercel as per NextJS' integration and uses socket.io to establish a peer to peer instanced connection between at max two players in the bingo game. 

## Instructions

Before proceeding, ensure that the bot has been invited to the Discord server with appropriate bot access.

1. Create a fresh Discord text channel and fill it with your speedrunning challenges (minimum of 2), this will be used as the input for Bingo Butler to generate a random board for the game. 
2. Run the following command to start the game based on the above, after running this command, the bot will wait for all participants to react to the generated message  

	```
	!start
	```
  
3. After all participants have been set, the bot (after some time) will @ mention the participants and send through an instanced URL to participate in the game. 
4. The website will then ask for Discord OAuth authentication for use in the game. 
5. Participants proceed with the game 
6. Once the game has completed, it will @ mention the winner. 

Note that the bot will clear most of its messages automatically, but there is a clear command as well to do it manually. 

## Libraries
- [DiscordJS v12](https://discord.js.org/#/), a NodeJS Discord bot framework. 

- [Socket.io](https://socket.io/), used for P2P connections 

## Development Notes
- Using v12 for DiscordJS API as new intents system in v13 does not allow for reading messages.
