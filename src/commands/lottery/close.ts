import { Message } from 'discord.js'
import { Command, CommandOptions } from '@src/command'
import { Inject, Service } from 'typedi'
import { LOTTERY_ID } from '@utils/consts'
import { LotteryRepository } from '@repositories/lottery-repository'
import { getCustomRepository } from 'typeorm'

@Service()
export default class extends Command {
    @Inject(LOTTERY_ID)
    private lottery!: number

    private lotteryRepository: LotteryRepository =
        getCustomRepository(LotteryRepository)

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

    get options(): CommandOptions {
        return {
            name: 'lottery close',
            signature: {
                command: 'lottery close',
                arguments: ['limit'],
            },
            description: 'Closes the current lottery to vots.',
            category: 'Information',
            requiredPermissions: ['ADMINISTRATOR'],
        }
    }
}
