import {Message} from 'discord.js'
import {Command} from '@src/command'
import DiscordClient from '@src/discord-client'
import {Container, Inject, Service} from 'typedi'
import LotteryService from '@services/lottery-service'
import User from '@models/user'
import {USER} from '@utils/consts'

@Service()
export default class VoteCommand extends Command {

    @Inject()
    private lotteryService!: LotteryService

    @Inject(USER)
    private currentUser!: User

    constructor(client: DiscordClient) {
        super(client, {
            description: 'Apply vote to lottery',
            category: 'Information',
            requiredPermissions: [],
        })
    }

    public async run(message: Message, args: string[]): Promise<void> {

        console.log(this.currentUser)

        await this.lotteryService.bet(this.currentUser, parseInt(args[0]))
    }
}
