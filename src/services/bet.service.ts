import {
    getConnection,
    getCustomRepository,
    getRepository,
    Repository,
} from 'typeorm'
import BetModel from '@models/bet.model'
import moment from 'moment'
import LotteryModel from '@models/lottery.model'
import UserModel from '@models/user.model'
import { Service } from 'typedi'
import { UserRepository } from '@repositories/user.repository'
import { LotteryRepository } from '@repositories/lottery.repository'
import { BetRepository } from '@repositories/bet.repository'

@Service()
export default class BetService {
    public async getBetsByLotteryId(lotteryId: number): Promise<BetModel[]> {
        return getCustomRepository(BetRepository).find({
            where: {
                lottery: { id: lotteryId },
            },
            relations: ['lottery', 'user'],
        })
    }

    public async getBetsByUserId(userId: number): Promise<BetModel[]> {
        return getCustomRepository(BetRepository).find({
            where: {
                user: { id: userId },
            },
            relations: ['user'],
        })
    }

    public async getBets(): Promise<BetModel[]> {
        return getCustomRepository(BetRepository).find()
    }

    public async createBet(
        number: number,
        lottery: LotteryModel,
        user: UserModel
    ): Promise<BetModel> {
        const betRepository = getCustomRepository(BetRepository)

        return await betRepository.save(<BetModel>{
            user: user,
            number: number,
            lottery: lottery,
            createdAt: moment().unix(),
        })
    }

    public async deleteBet(id: number): Promise<BetModel> {
        const bet = new BetModel()
        bet.id = id

        return getCustomRepository(BetRepository).remove(bet)
    }
}
