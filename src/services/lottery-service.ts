import {
    AlreadyVotedError,
    BetOutOfRangeError,
    LotteryClosedError,
    LotteryNotFoundError,
    UserNotFoundError,
} from '@src/errors'
import Lottery from '@src/models/lottery'
import User from '@src/models/user'
import Bet from '@src/models/bet'
import {BetRepository} from '@repositories/bet-repository'
import {InjectRepository} from 'typeorm-typedi-extensions'
import {Inject, Service} from 'typedi'
import {LOTTERY, USER} from '@utils/consts'
import BetService from '@services/bet-service'
import {Logger} from '@utils/logger'

@Service()
export default class LotteryService {

    @Inject(LOTTERY)
    private _lottery?: Lottery

    @Inject(USER)
    private _user?: User

    constructor(@InjectRepository(Bet) private betRepository: BetRepository,
                @Inject() private betService: BetService,
    ) {
    }


    get lottery(): Lottery {
        if (this._lottery === undefined) {
            throw new LotteryNotFoundError()
        }
        return this._lottery
    }

    get user(): User {
        if (this._user === undefined) {
            throw new UserNotFoundError()
        }
        return this._user
    }

    public async bet(betNumber: number): Promise<void> {

        Logger.info(`Calling lotteryService: ${JSON.stringify(this.user)}, betnumber: ${betNumber}`)

        if (!this.lottery.status) {
            throw new LotteryClosedError
        }

        let betTaken = await this.betRepository.isBetTaken(betNumber)

        if (betTaken !== undefined) {
            throw new AlreadyVotedError(betTaken.user)
        }

        if (betNumber > this.lottery.rangeMax || betNumber < this.lottery.rangeMin) {
            throw new BetOutOfRangeError()
        }

        await this.betService.createBet(betNumber, this.lottery, this.user)
    }

}
