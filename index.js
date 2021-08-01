require('dotenv').config();
const Discord = require('discord.js')
const client = new Discord.Client()

const {TOKEN, CHANNEL, PREFIX} = process.env
const {VOTE, LIST, DUMP, RANGE, START_LOTERY} = require('./options')
const Lottery = require('./models/lottery')
const lottery = new Lottery()
const OptionsHandler = require('./options-handler')

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {

    if (message.author.bot) return
    if (message.content.indexOf(PREFIX) !== 0) return

    const args = message.content.slice(PREFIX.length)
        .trim()
        .split(/ +/g)

    const command = args
        .shift()
        .toLowerCase()

    //command is PREFIX+lottery? ex: -lottery
    if (command !== 'lottery') {
        return
    }

    //is in the correct channel?
    if (message.channel.name !== CHANNEL) {
        return
    }

    // first argument is the operation
    // second argument values.
    try {
        const optionsHandler = new OptionsHandler(lottery, message)

        switch (args[0]) {
            case VOTE: optionsHandler.handleVote(args[1]); break
            case DUMP: optionsHandler.handleDump(); break
            case LIST: optionsHandler.handleList(); break
            case RANGE: optionsHandler.handleRange(args[1], args[2]); break
            case START_LOTERY: optionsHandler.handleStartLotery(); break
        }
    } catch (e) {
        message.reply(e.message)
    }
});


client.login(TOKEN)
