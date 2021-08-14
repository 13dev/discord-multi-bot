import {Message} from 'discord.js'
import {Command} from '@src/command'
import DiscordClient from '@src/discord-client'
import {Container, Inject, Service} from 'typedi'
import {LOTTERY_ID} from '@utils/consts'
import Lottery from '@models/lottery'
import {LotteryRepository} from '@repositories/lottery-repository'
import {getCustomRepository} from 'typeorm'

@Service()
export default class OpenLotteryCommand extends Command {

    @Inject(LOTTERY_ID)
    private lottery!: number

    private lotteryRepository: LotteryRepository = getCustomRepository(LotteryRepository)

    constructor(client: DiscordClient) {
        super(client, {
            description: 'Opens the current lottery to vots.',
            category: 'Information',
            requiredPermissions: [],
        })
    }

    public async run(message: Message): Promise<void> {
        const lottery = await this.lotteryRepository.findOneOrFail(this.lottery)
        if (lottery.status) {
            await super.respond(message.channel, 'Lottery already opened!')
            return
        }
        lottery.status = true
        await this.lotteryRepository.save(lottery)

        await message.channel.send('Lottery is now opened!')
    }
}
