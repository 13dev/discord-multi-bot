import {AlreadyVotedError, BetOutOfRangeError, LotteryClosedError} from '@src/src/errors'
import Lottery from '@src/src/models/lottery'
import User from '@src/src/models/user'
import {LotteryRepositoryInterface} from '@src/src/repositories/lottery-repository'
import {BetRepositoryInterface} from '@src/src/repositories/bet-repository'
import {UserRepositoryInterface} from '@src/src/repositories/user-repository'
import Bet from '@src/src/models/bet'
import moment from 'moment'

export default class LotteryService {

    constructor(
        private lottery: Lottery,
        private lotteryRepository: LotteryRepositoryInterface,
        private betRepository: BetRepositoryInterface,
        private userRepository: UserRepositoryInterface) {
    }

    create(lottery: Lottery) {
        return this.lotteryRepository.create(lottery)
    }

    bet(user: User, betNumber: number) {

        if (!this.lottery.status) {
            throw new LotteryClosedError
        }

        if (this.betRepository.isBetTaken(betNumber)) {
            const bet = this.betRepository.getByUserId(user.id)
            throw new AlreadyVotedError(
                this.userRepository.getById(bet.userId)
            )
        }

        if (betNumber > this.lottery.range.max || betNumber < this.lottery.range.min) {
            throw new BetOutOfRangeError
        }

        this.betRepository.create(
            new Bet(user.id, this.lottery.id as number, moment().unix(), betNumber)
        )
    }

}
