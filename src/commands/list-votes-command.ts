import {Message} from 'discord.js'
import {Command} from '@src/command'
import DiscordClient from '@src/discord-client'
import BetService from '@services/bet-service'
import {Inject, Service} from 'typedi'
import {LOTTERY_ID} from '@utils/consts'

@Service()
export default class ListVotesCommand extends Command {
    @Inject()
    private betService!: BetService

    @Inject(LOTTERY_ID)
    private lottery!: number

    constructor(client: DiscordClient) {
        super(client, {
            description: 'List all votes.',
            category: 'Information',
            requiredPermissions: [],
        })
    }

    public async run(message: Message): Promise<void> {

        let output = ''

        await this.betService.getBetsByLotteryId(this.lottery).then(bets => {
            bets.forEach(bet => {
                output += `Number: ${bet.number} User: ${bet.user.name} \n`
            })
        })

        await super.respond(message.channel, '```' + output + '```')

    }
}
