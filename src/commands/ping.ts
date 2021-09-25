import { Message } from 'discord.js'
import { Command } from '@src/command'
import DiscordClient from '@src/discord-client'
import { Container, Service } from 'typedi'
import { LOTTERY_ID } from '@utils/consts'

@Service()
export default class extends Command {
    constructor(client: DiscordClient) {
        super(client, {
            name: 'ping',
            description: 'Pings the bot.',
            category: 'Information',
            requiredPermissions: [],
        })
    }

    public async run(message: Message): Promise<void> {
        const m = await message.reply('Ping?')
        await m.edit(
            ':ping_pong: Pong! \n Latency is ' +
                (m.createdTimestamp - message.createdTimestamp) +
                'ms. \n API Latency is ' +
                Math.round(this.client.ws.ping)
        )
    }
}
