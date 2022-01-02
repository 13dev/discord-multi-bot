import { EntityRepository, Repository } from 'typeorm'
import LotteryModel from '@models/lottery.model'

@EntityRepository(LotteryModel)
export class LotteryRepository extends Repository<LotteryModel> {
    public async getCurrentLottery(): Promise<LotteryModel | undefined> {
        return await this.findOne({
            order: {
                id: 'DESC',
            },
        })
    }

    isBetTaken(number: number) {
        return this.find({
            where: { number: number },
        })
    }
}
