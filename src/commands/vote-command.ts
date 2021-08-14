import {Message} from 'discord.js'
import {Command} from '@src/command'
import DiscordClient from '@src/discord-client'
import {Container, Inject, Service} from 'typedi'
import LotteryService from '@services/lottery-service'
import User from '@models/user'

@Service()
export default class VoteCommand extends Command {

    @Inject()
    private lotteryService!: LotteryService

    constructor(client: DiscordClient) {
        super(client, {
            description: 'Apply vote to lottery',
            category: 'Information',
            requiredPermissions: [],
        })
    }

    public async run(message: Message, args: string[]): Promise<void> {

        let user = new User
        user.name = message.author.username

        console.log(typeof message.author)

        await this.lotteryService.bet(user, parseInt(args[0]))
    }
}
