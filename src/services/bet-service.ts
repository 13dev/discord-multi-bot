import {getConnection, getCustomRepository, getRepository, Repository} from 'typeorm'
import Bet from '@models/bet'
import moment from 'moment'
import Lottery from '@models/lottery'
import User from '@models/user'
import {Service} from 'typedi'
import {UserRepository} from '@repositories/user-repository'
import {LotteryRepository} from '@repositories/lottery-repository'
import {BetRepository} from '@repositories/bet-repository'

@Service()
export default class BetService {

    public async getBetsByLotteryId(lotteryId: number): Promise<Bet[]> {
        return getCustomRepository(BetRepository).find({
            where: {
                lottery: {id: lotteryId},
            },
            relations: ['lottery'],
        })
    }

    public async getBetsByUserId(userId: number): Promise<Bet[]> {
        return getCustomRepository(BetRepository).find({
            where: {
                user: {id: userId},
            },
            relations: ['user'],
        })
    }

    public async getBets(): Promise<Bet[]> {
        return getCustomRepository(BetRepository).find()
    }

    public async createBet(number: number, lottery: Lottery, user: User): Promise<Bet> {

        return await getConnection().transaction(async manager => {
            let bet = new Bet()
            bet.createdAt = moment().unix()
            bet.number = number
            bet.lottery = lottery
            bet.user = user

            const betRepository = manager.getCustomRepository(BetRepository)
            const userRepository = manager.getCustomRepository(UserRepository)
            const lotteryRepository = manager.getCustomRepository(LotteryRepository)
            await userRepository.save(user)
            await lotteryRepository.save(lottery)
            return await betRepository.save(bet)
        })

    }

    public async deleteBet(id: number): Promise<Bet> {
        const bet = new Bet()
        bet.id = id

        return getCustomRepository(BetRepository).remove(bet)
    }
}
