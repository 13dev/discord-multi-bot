import {Message} from 'discord.js'
import {Command} from '@src/command'
import DiscordClient from '@src/discord-client'
import BetService from '@services/bet-service'
import {Inject, Service} from 'typedi'

@Service('list-votes')
export default class ListVotesCommand extends Command {
    @Inject()
    private betService!: BetService

    constructor(client: DiscordClient) {
        super(client, {
            name: 'list-votes',
            description: 'List all votes.',
            category: 'Information',
            usage: client.config.prefix.concat('list'),
            cooldown: 1000,
            requiredPermissions: [],
        })
    }

    public async run(message: Message): Promise<void> {

        let output = '';

        await this.betService.getBets().then(bets => {
            bets.forEach(bet => {
                output += `Number: ${bet.number} \n`
            })
        })

        await super.respond(message.channel,'```' + output + '```')

    }
}
