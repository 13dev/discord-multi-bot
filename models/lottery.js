const {
    LotteryClosedError,
    AlreadyVotedError,
    BetOutOfRangeError
} = require('../errors')

const db = require('../database')
const moment = require('moment')

module.exports = class Lottery {
    constructor() {
        this._status = false
        this._dates = {start: null, end: null}
        this._range = {min: 0, max: 0}
    }

    set startDate(date) {
        this._dates.start = date
    }

    set endDate(date) {
        this._dates.end = date
    }

    set range(range) {
        this._range = range
    }

    get range() {
        return this._range
    }

    get users() {
        return this._users
    }

    create() {
        const stmt = db.prepare('INSERT INTO lotteries (date_start, date_end, status, range_min, range_max) VALUES (?, ?, ?, ?, ?)');
        const result = stmt.run(moment().unix(), this._dates.end, this._status, this.range.min, this.range.max);

        return result.lastInsertRowid
    }

    addUser(client) {
        // user already exists
        if (this.users.find(user => user.user.id === client.id)) {
            return false
        }

        const stmt = db.prepare('INSERT INTO lotteries (date_start, date_end, status, range_min, range_max) VALUES (?, ?, ?, ?, ?)');
        const result = stmt.run(moment().unix(), this._dates.end, this._status, this.range.min, this.range.max);

        this._users.push({
            user: client,
            number: null,
        })

        return true
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

    start() {
        this._status = true
    }

    chooseWinner() {
        // do stuff
    }

    getBets() {
        return Object.values(this.users).map(user => user.number)
    }

    isBetTaken(number) {
        return this.getBets().includes(number)
    }

    getCurrentLottery() {
        return db
            .prepare('SELECT * FROM lotteries ORDER BY id DESC LIMIT 1')
            .get()
    }

}

//[{user: {}, number: 1}]
