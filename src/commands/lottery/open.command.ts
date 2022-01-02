import { Message } from 'discord.js'
import { Command, CommandOptions } from '@src/command'
import { Inject, Service } from 'typedi'
import { LOTTERY_ID } from '@utils/consts.util'
import { LotteryRepository } from '@repositories/lottery.repository'
import { getCustomRepository } from 'typeorm'

@Service()
export default class x extends Command {
    @Inject(LOTTERY_ID)
    private lottery!: number

    private lotteryRepository: LotteryRepository =
        getCustomRepository(LotteryRepository)

    public async run(message: Message): Promise<void> {
        const lottery = await this.lotteryRepository.findOneOrFail(this.lottery)

        if (lottery.status) {
            // await super.respond(message.channel, 'LotteryModel already opened!')
            return
        }

        lottery.status = true
        await this.lotteryRepository.save(lottery)

        await message.channel.send('LotteryModel is now opened!')
    }

    get options(): CommandOptions {
        return {
            signature: {
                command: 'lottery open',
                arguments: [],
            },
            name: 'lottery open',
            description: 'Opens the current lottery to vots.',
            category: 'Information',
            requiredPermissions: ['ADMINISTRATOR'],
        }
    }
}
