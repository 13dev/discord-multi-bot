import OptionsHandler, {Options} from '@src/options-handler'
import dotenv from 'dotenv'
import {Client} from 'discord.js'


const client = new Client()
dotenv.config()
const token: string = process.env.TOKEN || ''
const channel: string = process.env.CHANNEL || 'lottery'
const prefix: string = process.env.PREFIX || '-'



client.on('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`)
})

client.on('message', message => {

    if (message.author.bot) return
    if (message.content.indexOf(prefix) !== 0) return

    const args = message.content.slice(prefix.length)
        .trim()
        .split(/ +/g) as Array<string>

    const command = (args.shift() as string).toLowerCase()

    //command is PREFIX+lottery? ex: -lottery
    if (command !== 'lottery') {
        return
    }

    //is in the correct channel?
    if (message.channel.id !== channel) {
        return
    }

    // first argument is the operation
    // second argument values.
    try {
        const optionsHandler = new OptionsHandler(lottery, message)

        switch (args[0]) {
            case Options.VOTE:
                optionsHandler.handleVote(parseInt(args[1]))
                break
            case Options.DUMP:
                optionsHandler.handleDump()
                break
            case Options.LIST:
                optionsHandler.handleList()
                break
            case Options.RANGE:
                optionsHandler.handleRange(parseInt(args[1]), parseInt(args[2]))
                break
            case Options.START_LOTERY:
                optionsHandler.handleStartLotery()
                break
        }
    } catch (e) {
        message.reply(e.message)
    }
})


client.login(TOKEN)
