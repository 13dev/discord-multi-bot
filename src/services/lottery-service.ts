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
import {LOTTERY_ID, USER} from '@utils/consts'
import BetService from '@services/bet-service'
import {Logger} from '@utils/logger'
import {getCustomRepository} from 'typeorm'
import {LotteryRepository} from '@repositories/lottery-repository'

@Service()
export default class LotteryService {

    @Inject(LOTTERY_ID)
    private _lottery!: number

    @Inject(USER)
    private _user!: User

    constructor(@InjectRepository(Bet) private betRepository: BetRepository,
                @Inject() private betService: BetService,
    ) {
    }


    private async lottery(): Promise<Lottery> {

        if (this._lottery === undefined) {
            throw new LotteryNotFoundError()
        }

        return await getCustomRepository(LotteryRepository).findOneOrFail(this._lottery)

    }

    get user(): User {
        if (this._user === undefined) {
            throw new UserNotFoundError()
        }
        return this._user
    }

    public async bet(betNumber: number): Promise<Bet> {

        Logger.info(`Calling lotteryService: ${JSON.stringify(this.user)}, betnumber: ${betNumber}`)

        const lottery = await this.lottery()

        if (!lottery.status) {
            throw new LotteryClosedError
        }

        let bet = await this.betRepository.getBetByNumberAndLottery(betNumber, lottery.id)

        if (bet) {
            throw new AlreadyVotedError(bet.user)
        }

        if (betNumber > lottery.rangeMax || betNumber < lottery.rangeMin) {
            throw new BetOutOfRangeError()
        }

        let existingBet = await this.betRepository.findOne({
            where: {
                lottery: lottery,
                user: this.user,
            },
        })

        // Update bet
        if (existingBet) {
            existingBet.number = betNumber
            await this.betRepository.update({id: existingBet.id}, existingBet)

            return existingBet
        }


        return await this.betService.createBet(betNumber, lottery, this.user)

    }

}
