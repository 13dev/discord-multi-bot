import {EntityRepository, Repository} from 'typeorm'
import Lottery from '@models/lottery'

@EntityRepository(Lottery)
export class LotteryRepository extends Repository<Lottery> {

    public async getCurrentLottery(): Promise<Lottery | undefined> {
        return await this.findOne({
            order: {
                id: 'DESC'
            }
        })
    }

    isBetTaken(number: number) {
        return this.find({
            where: {number: number}
        })
    }

}
