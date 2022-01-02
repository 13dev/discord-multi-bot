import { EntityRepository, Repository } from 'typeorm'
import BetModel from '@models/bet.model'

@EntityRepository(BetModel)
export class BetRepository extends Repository<BetModel> {
    public async getBetByNumberAndLottery(
        number: number,
        lottery: number
    ): Promise<BetModel | undefined> {
        return this.findOne({
            where: { number: number, lottery: lottery },
            relations: ['user'],
        })
    }
}
