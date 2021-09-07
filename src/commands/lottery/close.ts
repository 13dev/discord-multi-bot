import {Message} from 'discord.js'
import {Command, CommandGroups} from '@src/command'
import DiscordClient from '@src/discord-client'
import {Inject, Service} from 'typedi'
import {LOTTERY_ID} from '@utils/consts'
import {LotteryRepository} from '@repositories/lottery-repository'
import {getCustomRepository} from 'typeorm'

@Service()
export default class LotteryCloseCommand extends Command {
    group: CommandGroups = CommandGroups.LOTTERY

    @Inject(LOTTERY_ID)
    private lottery!: number

    private lotteryRepository: LotteryRepository = getCustomRepository(LotteryRepository)

    constructor(client: DiscordClient) {
        super(client, {
            name: 'close',
            description: 'Closes the current lottery to vots.',
            category: 'Information',
            requiredPermissions: ['ADMINISTRATOR'],
        })
    }

    public async run(message: Message): Promise<void> {
        const lottery = await this.lotteryRepository.findOneOrFail(this.lottery)
        if (!lottery.status) {
            await super.respond(message.channel, 'Lottery already closed!')
            return
        }
        lottery.status = false
        await this.lotteryRepository.save(lottery)

        await message.channel.send('Lottery is now closed!')
    }
}
