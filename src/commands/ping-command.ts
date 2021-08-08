import {Message} from 'discord.js'
import {Command} from '@src/command'
import DiscordClient from '@src/discord-client'
import {Service} from 'typedi'

@Service('ping')
export default class PingCommand extends Command {
    constructor(client: DiscordClient) {
        super(client, {
            description: 'Pings the bot.',
            category: 'Information',
            requiredPermissions: [],
        })
    }

    public async run(message: Message): Promise<void> {
        await super.respond(message.channel, 'Pong!')
    }
}
