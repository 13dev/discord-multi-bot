import {Message} from 'discord.js'
import {Command, CommandGroups} from '@src/command'
import DiscordClient from '@src/discord-client'
import {Inject, Service} from 'typedi'
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
            name: 'vote',
            group: CommandGroups.LOTTERY,
            description: 'Apply vote to lottery',
            category: 'Information',
            requiredPermissions: [],
        })
    }

    public async run(message: Message, args: string[]): Promise<void> {
        await this.lotteryService.bet(parseInt(args[0]))
    }
}
