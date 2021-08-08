import {AlreadyVotedError, BetOutOfRangeError, LotteryClosedError} from '@src/errors'
import Lottery from '@src/models/lottery'
import User from '@src/models/user'
import Bet from '@src/models/bet'
import moment from 'moment'

export default class LotteryService {

    constructor(
        private lottery: Lottery) {
    }

    create(lottery: Lottery) {
        return
    }

    bet(user: User, betNumber: number) {

        if (!this.lottery.status) {
            throw new LotteryClosedError
        }

        // if (this.betRepository.isBetTaken(betNumber)) {
        //     const bet = this.betRepository.getByUserId(user.id)
        //     throw new AlreadyVotedError(
        //         this.userRepository.getById(bet.userId)
        //     )
        // }
        //
        // if (betNumber > this.lottery.range.max || betNumber < this.lottery.range.min) {
        //     throw new BetOutOfRangeError
        // }
        //
        // this.betRepository.create(
        //     new Bet(user.id, this.lottery.id as number, moment().unix(), betNumber)
        // )
    }

}
