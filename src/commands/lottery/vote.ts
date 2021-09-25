import { Message } from 'discord.js'
import { Command } from '@src/command'
import DiscordClient from '@src/discord-client'
import { Inject, Service } from 'typedi'
import LotteryService from '@services/lottery-service'

@Service()
export default class extends Command {
    @Inject()
    private lotteryService!: LotteryService

    constructor(client: DiscordClient) {
        super(client, {
            name: 'lottery vote',
            description: 'Apply vote to lottery',
            category: 'Information',
            requiredPermissions: [],
        })
    }

    public async run(message: Message, args: string[]): Promise<void> {
        await this.lotteryService.bet(parseInt(args[0]))
    }
}
