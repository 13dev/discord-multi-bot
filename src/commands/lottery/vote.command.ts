import { Message } from 'discord.js'
import { Command, CommandOptions } from '@src/command'
import { Inject, Service } from 'typedi'
import LotteryService from '@services/lottery.service'

@Service()
export default class extends Command {
    @Inject()
    private lotteryService!: LotteryService

    public async run(message: Message, args: string[]): Promise<void> {
        await this.lotteryService.bet(parseInt(args[0]))
    }

    get options(): CommandOptions {
        return {
            name: ['lottery vote'],
            signature: {
                command: 'lottery vote',
                arguments: ['voteNumber'],
            },
            description: 'Apply vote to lottery',
            category: 'Information',
            requiredPermissions: [],
        }
    }
}
