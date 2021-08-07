import {AlreadyVotedError, LotteryClosedError} from '@src/errors'
import Lottery from '@models/lottery'
import database from '@src/database'
import moment from 'moment'

export default class LotteryService {

    create(lottery: Lottery) {
        const stmt = database.prepare(
            'INSERT INTO lotteries (date_start, date_end, status, range_min, range_max) VALUES (?, ?, ?, ?, ?)'
        )
        const result = stmt.run(moment().unix(), lottery.dates.end, lottery.status, lottery.range.min, lottery.range.max)

        return result.lastInsertRowid
    }

    bet(user: User, betNumber) {

        if (!this._status) {
            throw new LotteryClosedError()
        }

        if (this.isBetTaken(betNumber)) {
            throw new AlreadyVotedError(
                this.users.find(user => betNumber === user.number).user
            )
        }

        if (betNumber > this.range.max || betNumber < this.range.min) {
            throw new BetOutOfRangeError()
        }

        let user = this.users.find(user => user.user.id === client.id)
        user.number = betNumber
    }
}
