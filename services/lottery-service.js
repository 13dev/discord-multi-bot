const db = require('../database')
const moment = require('moment')

module.exports = class LotteryService {

    create(lottery) {
        const stmt = db.prepare('INSERT INTO lotteries (date_start, date_end, status, range_min, range_max) VALUES (?, ?, ?, ?, ?)');
        const result = stmt.run(moment().unix(), lottery._dates.end, lottery._status, lottery.range.min, lottery.range.max);

        return result.lastInsertRowid
    }

    bet(client, betNumber) {

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
