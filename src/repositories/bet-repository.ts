import {EntityRepository, Repository} from 'typeorm'
import Bet from '@models/bet'

@EntityRepository(Bet)
export class BetRepository extends Repository<Bet> {

    public async isBetTaken(number: number): Promise<Bet | undefined> {
        return this.findOne({
            where: {number: number},
        })
    }

}
