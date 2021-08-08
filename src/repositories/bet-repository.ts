import {EntityRepository, Repository} from 'typeorm'
import Bet from '@models/bet'
import User from '@models/user'

@EntityRepository(Bet)
export class BetRepository extends Repository<User> {

    isBetTaken(number: number) {
        return this.find({
            where: {number: number}
        })
    }

}
