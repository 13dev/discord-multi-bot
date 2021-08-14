import {AlreadyVotedError, BetOutOfRangeError, LotteryClosedError} from '@src/errors'
import Lottery from '@src/models/lottery'
import User from '@src/models/user'
import Bet from '@src/models/bet'
import {BetRepository} from '@repositories/bet-repository'
import {InjectRepository} from 'typeorm-typedi-extensions'
import {Inject} from 'typedi'
import {LOTTERY} from '@utils/consts'
import BetService from '@services/bet-service'

export default class LotteryService {

    @Inject(LOTTERY)
    private _lottery?: Lottery

    constructor(@InjectRepository(Bet) private betRepository: BetRepository,
                @Inject() private betService: BetService,
    ) {
    }


    get lottery(): Lottery {
        if (this._lottery === undefined) {
            this._lottery = new Lottery()
        }
        return this._lottery
    }

    public async bet(user: User, betNumber: number): Promise<void> {

        if (!this.lottery.status) {
            throw new LotteryClosedError
        }

        let betTaken = await this.betRepository.isBetTaken(betNumber)

        if (betTaken !== undefined) {
            throw new AlreadyVotedError(betTaken.user)
        }

        if (betNumber > this.lottery.rangeMin || betNumber < this.lottery.rangeMax) {
            throw new BetOutOfRangeError()
        }

        await this.betService.createBet(betNumber, this.lottery, user)
    }

}
