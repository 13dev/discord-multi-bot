import {Message} from 'discord.js'
import {Command} from '@src/command'
import DiscordClient from '@src/discord-client'
import {Container, Service} from 'typedi'

@Service()
export default class VoteCommand extends Command {
    constructor(client: DiscordClient) {
        super(client, {
            description: 'Apply vote to lottery',
            category: 'Information',
            requiredPermissions: [],
        })
    }

    public async run(message: Message): Promise<void> {

    }
}
