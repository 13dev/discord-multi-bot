import {AlreadyVotedError, LotteryClosedError} from '@src/errors'
import Lottery from '@models/lottery'
import database from '@src/database'
import moment from 'moment'
import User from '@models/user'
import {LotteryRepositoryInterface} from '@repositories/lottery-repository'

export default class LotteryService {

    constructor(
        private lottery: Lottery,
        private lotteryRepository: LotteryRepositoryInterface) {
    }

    create(lottery: Lottery) {
        return this.lotteryRepository.create(lottery)
    }

    bet(user: User, betNumber: number) {

        if (!this.lottery.status) {
            throw new LotteryClosedError()
        }

        if (this.isBetTaken(betNumber)) {
            throw new AlreadyVotedError(
                this.users.find(user => betNumber === user.number).user,
            )
        }

        if (betNumber > lottery.range.max || betNumber < this.range.min) {
            throw new BetOutOfRangeError()
        }

        let user = this.users.find(user => user.user.id === client.id)
        user.number = betNumber
    }


}
