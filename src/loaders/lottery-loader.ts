import {getCustomRepository} from 'typeorm'
import {Logger} from '@utils/logger'
import {Container, Service, Token} from 'typedi'
import {LotteryRepository} from '@repositories/lottery-repository'
import Lottery from '@models/lottery'
import {LOTTERY} from '@utils/consts'
import moment from 'moment'

@Service()
export default class LotteryLoader {
    constructor() {
        const lotteryRepository = getCustomRepository(LotteryRepository)

        lotteryRepository.getCurrentLottery()
            .then(async (lottery: Lottery | undefined) => {
                if (!lottery) {
                    Logger.info('Creating a new dummy lottery!')
                    lottery = await lotteryRepository.save({
                        rangeMax: 100,
                        rangeMin: 0,
                        status: false,
                        dateEnd: moment().unix(),
                        dateBegin: moment().unix(),
                    })
                }

                Logger.info('Setting the lottery id to: ' + lottery.id.toString())
                Container.set(LOTTERY, lottery)
            })
            .catch(console.log)

    }
}
