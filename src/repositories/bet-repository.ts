import {EntityRepository, Repository} from 'typeorm'
import Bet from '@models/bet'

@EntityRepository(Bet)
export class BetRepository extends Repository<Bet> {

    public async getBetByNumberAndLottery(number: number, lottery: number): Promise<Bet | undefined> {
        return this.findOne({
            where: {number: number, lottery: lottery},
            relations: ['user']
        })
    }

}
