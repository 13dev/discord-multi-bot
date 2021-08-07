import {AlreadyVotedError, BetOutOfRangeError, LotteryClosedError} from '@src/errors'
import Lottery from '@models/lottery'
import User from '@models/user'
import {LotteryRepositoryInterface} from '@repositories/lottery-repository'
import {BetRepositoryInterface} from '@repositories/bet-repository'
import {UserRepositoryInterface} from '@repositories/user-repository'
import Bet from '@models/bet'
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
