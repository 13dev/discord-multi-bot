import {getConnection, getCustomRepository} from 'typeorm'
import {Logger} from '@utils/logger'
import {Container as c, Container, Service, Token} from 'typedi'
import {LotteryRepository} from '@repositories/lottery-repository'
import Lottery from '@models/lottery'
import {LOTTERY} from '@utils/consts'

@Service()
export default class LotteryLoader {
    constructor() {
        getCustomRepository(LotteryRepository).getCurrentLottery()
            .then((lottery: Lottery | undefined) => {
                if (!lottery) return

                Logger.info('Setting the lottery id to: ' + lottery?.id.toString())
                Container.set<Token<Lottery>>(LOTTERY, lottery)
            })
            .catch(console.log)

    }
}
