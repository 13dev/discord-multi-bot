import { Message } from 'discord.js'
import { Command, CommandOptions } from '@src/command'
import DiscordClient from '@src/discord-client'
import { Container, Service } from 'typedi'
import { LOTTERY_ID } from '@utils/consts'

@Service()
export default class extends Command {
    get options(): CommandOptions {
        return {
            name: 'ping',
            signature: {
                command: 'ping',
            },
            description: 'Pings the bot.',
            category: 'Information',
            requiredPermissions: [],
        }
    }

    public async run(message: Message): Promise<void> {
        const sendedMessage = await message.reply('Hello!')
        const latency =
            sendedMessage.createdTimestamp - message.createdTimestamp
        const ping = Math.round(this.client.ws.ping)

        await sendedMessage.edit(
            `:ping_pong: Pong! \n - Latency is ${latency} ms. \n API Latency is ${ping}`
        )
    }
}
