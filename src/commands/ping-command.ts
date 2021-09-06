import {Message} from 'discord.js'
import {Command} from '@src/command'
import DiscordClient from '@src/discord-client'
import {Container, Service} from 'typedi'
import {LOTTERY_ID} from '@utils/consts'

@Service()
export default class PingCommand extends Command {
    constructor(client: DiscordClient) {
        super(client, {
            name: 'ping',
            description: 'Pings the bot.',
            category: 'Information',
            requiredPermissions: [],
        })
    }

    public async run(message: Message): Promise<void> {
        await super.respond(message.channel, 'Pong! ' + JSON.stringify(Container.get(LOTTERY_ID)))
    }
}
