import {getConnection, getRepository, Repository} from 'typeorm'
import Bet from '@models/bet'
import moment from 'moment'
import Lottery from '@models/lottery'
import User from '@models/user'
import {Service} from 'typedi'
import {InjectRepository} from 'typeorm-typedi-extensions'

@Service()
export default class BetService {

    @InjectRepository(Bet)
    private betRepository!: Repository<Bet>


    public async getBetsByLotteryId(lotteryId: number): Promise<Bet[]> {
        return this.betRepository.find({
            where: {
                lottery: {id: lotteryId},
            },
            relations: ['lottery'],
        })
    }

    public async getBetsByUserId(userId: number): Promise<Bet[]> {
        return this.betRepository.find({
            where: {
                user: {id: userId},
            },
            relations: ['user'],
        })
    }

    public async getBets(): Promise<Bet[]> {
        return this.betRepository.find()
    }

    public async createBet(number: number, lottery: Lottery, user: User): Promise<Bet> {
        const bet = new Bet()
        bet.createdAt = moment().unix()
        bet.number = number
        bet.lottery = lottery
        bet.user = user
        return this.betRepository.save(bet)

    }

    public async deleteBet(id: number): Promise<Bet> {
        const bet = new Bet()
        bet.id = id

        return this.betRepository.remove(bet)
    }
}
