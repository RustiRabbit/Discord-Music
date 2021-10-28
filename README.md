# Sink Bot
Hi! Sink is a Discord Music Bot written in the wake of the demise of Rythm and Groovy. It is intended for personal use, but is available for use by anyone! We run through a docker container, but you can run it however you want. To build, you'll need Node 16 and build tools. You'll also need to register your own discord bot through the [Discord Developer Portal](https://discord.com/developers/applications) and put your token in the a `.env` file. When inviting your bot to the server, it needs a variety of permissions. Try messing around and adding/removing if it doesn' work.

# Deployment Instructions
Setup Environment Variables. Copy the `.env.template` file and name it `.env` and enter your discord token
Then run `npm  install` and `npm start` to start the application
