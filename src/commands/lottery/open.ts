import {Message} from 'discord.js'
import {Command, CommandGroups} from '@src/command'
import DiscordClient from '@src/discord-client'
import {Inject, Service} from 'typedi'
import {LOTTERY_ID} from '@utils/consts'
import {LotteryRepository} from '@repositories/lottery-repository'
import {getCustomRepository} from 'typeorm'

@Service()
export default class extends Command {

    @Inject(LOTTERY_ID)
    private lottery!: number

    group: CommandGroups = CommandGroups.LOTTERY

    private lotteryRepository: LotteryRepository = getCustomRepository(LotteryRepository)

    constructor(client: DiscordClient) {
        super(client, {
            name: 'open',
            description: 'Opens the current lottery to vots.',
            category: 'Information',
            requiredPermissions: ['ADMINISTRATOR'],
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
