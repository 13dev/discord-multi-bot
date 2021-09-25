import { Message, MessageEmbed } from 'discord.js'
import { Command, CommandOptions } from "@src/command";
import DiscordClient from '@src/discord-client'
import BetService from '@services/bet-service'
import { Inject, Service } from 'typedi'
import { LOTTERY_ID } from '@utils/consts'

@Service()
export default class extends Command {
    @Inject()
    private betService!: BetService

    @Inject(LOTTERY_ID)
    private lottery!: number

    public async run(message: Message): Promise<void> {
        const exampleEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(this.options.description)

        await this.betService.getBetsByLotteryId(this.lottery).then((bets) => {
            bets.forEach((bet) =>
                exampleEmbed.addField(
                    bet.user.name,
                    '`' + bet.number + '`',
                    true
                )
            )
        })

        exampleEmbed.setTimestamp().setFooter('Lottery Bot')
        await super.respond(message.channel, exampleEmbed)
    }

    get options(): CommandOptions {
        return {
            name: 'lottery list',
            signature: {
                command: 'lottery list'
            },
            description: 'Lista de Todos os Votos',
            category: 'Information',
            requiredPermissions: [],
        }
    }
}
