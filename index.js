require('dotenv').config();
const Discord = require('discord.js')
const client = new Discord.Client()

const {TOKEN, CHANNEL, PREFIX} = process.env
const {VOTE, LIST, DUMP} = require('./operations')
const Lottery = require('./lottery.js')
const lottery = new Lottery()


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

    console.log(args)
    try {
        switch (args[0]) {
            case VOTE: {
                lottery.addClient(message.author)
                lottery.addVote(message.author, args[1])
                break
            }
            case DUMP: {
                message.reply('```js ' + JSON.stringify(lottery.users) + ' ```')
                console.log(lottery.users)
                break
            }

            case LIST: {
                let output = '\n'

                lottery.users.forEach(entry => {
                    output += `Username: ${entry.user.username}, Number: ${entry.number} \n`
                })

                message.reply('```' + output + '```')
                break
            }
        }
    } catch (e) {
        message.reply(e.message)
    }


});


client.login(TOKEN);
