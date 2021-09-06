import {Message, MessageEmbed} from 'discord.js'
import {Command, CommandGroups} from '@src/command'
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
            name: 'list',
            group: CommandGroups.LOTTERY,
            description: 'Lista de Todos os Votos',
            category: 'Information',
            requiredPermissions: [],
        })
    }

    public async run(message: Message): Promise<void> {

        const exampleEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(this.commandOptions.description)

        await this.betService.getBetsByLotteryId(this.lottery)
            .then(bets => {
                bets.forEach(bet => exampleEmbed.addField(bet.user.name, '`' + bet.number + '`', true))
            })

        exampleEmbed.setTimestamp()
            .setFooter('Lottery Bot')
        await super.respond(message.channel, exampleEmbed)

    }
}
