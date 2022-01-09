import { Message } from 'discord.js'
import { Command, CommandOptions } from '@src/command'
import { Container, Service } from 'typedi'

@Service()
export default class extends Command {
    get options(): CommandOptions {
        return {
            name: ['ping'],
            signature: {
                command: 'ping',
                arguments: ['s'],
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
