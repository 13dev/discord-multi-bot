import {Message} from 'discord.js'
import {Command} from '@src/command'
import DiscordClient from '@src/discord-client'
import {Container, Service} from 'typedi'

@Service()
export default class PingCommand extends Command {
    constructor(client: DiscordClient) {
        super(client, {
            name: 'ping',
            description: 'Pings the bot.',
            category: 'Information',
            usage: client.config.prefix.concat('ping'),
            cooldown: 1000,
            requiredPermissions: [],
        })
    }

    public async run(message: Message): Promise<void> {
        await super.respond(message.channel, 'Pong!')
    }
}
