import {Message} from 'discord.js'
import {Command} from '@src/command'
import DiscordClient from '@src/discord-client'

export default class Ping extends Command {
    constructor(client: DiscordClient) {
        super(client, {
            name: 'ping',
            description: 'Pings the bot.',
            category: 'Information',
            usage: client.config.prefix.concat('ping'),
            cooldown: 1000,
            requiredPermissions: ['SEND_MESSAGES'],
        })
    }

    public async run(message: Message): Promise<void> {
        await super.respond(message.channel, 'Pong!')
    }
}
