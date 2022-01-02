import { getCustomRepository } from 'typeorm'
import { LoggerUtil } from '@utils/logger.util'
import { Container, Service, Token } from 'typedi'
import { LotteryRepository } from '@repositories/lottery.repository'
import LotteryModel from '@models/lottery.model'
import { LOTTERY_ID } from '@utils/consts.util'
import moment from 'moment'

export default async function lotteryLoader() {
    const lotteryRepository = getCustomRepository(LotteryRepository)
    await lotteryRepository
        .getCurrentLottery()
        .then(async (lottery: LotteryModel | undefined) => {
            if (!lottery) {
                LoggerUtil.info('Creating a new dummy lottery!')
                lottery = await lotteryRepository.save({
                    rangeMax: 100,
                    rangeMin: 0,
                    status: false,
                    dateEnd: moment().unix(),
                    dateBegin: moment().unix(),
                })
            }

            LoggerUtil.info(
                'Setting the lottery id to: ' + lottery.id.toString()
            )
            await Container.set<Token<number>>(LOTTERY_ID, lottery.id)
        })
        .catch(console.log)
}
