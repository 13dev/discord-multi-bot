import {AlreadyVotedError, BetOutOfRangeError, LotteryClosedError} from '@src/errors'
import Lottery from '@src/models/lottery'
import User from '@src/models/user'
import Bet from '@src/models/bet'
import {BetRepository} from '@repositories/bet-repository'
import {InjectRepository} from 'typeorm-typedi-extensions'
import {Inject} from 'typedi'
import {LOTTERY} from '@utils/consts'

export default class LotteryService {

    @Inject(LOTTERY)
    private _lottery?: Lottery

    constructor(@InjectRepository(Bet) private betRepository: BetRepository) {
    }


    get lottery(): Lottery {
        if(this._lottery === undefined) {
            this._lottery = new Lottery()
        }
        return this.lottery
    }

    public async bet(user: User, betNumber: number): Promise<void> {

        if (!this.lottery.status) {
            throw new LotteryClosedError
        }

        if (await this.betRepository.isBetTaken(betNumber)) {
            throw new AlreadyVotedError(

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
