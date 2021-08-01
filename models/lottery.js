const {
    LotteryClosedError,
    AlreadyVotedError,
    BetOutOfRangeError
} = require('../errors')

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

    addUser(client) {
        // user already exists
        if (this.users.find(user => user.user.id === client.id)) {
            return false
        }

        this._users.push({
            user: client,
            number: null,
        })

        return true
    }

    bet(client, guessNumber) {

        if (!this._status) {
            throw new LotteryClosedError()
        }

        if (this.isBetTaken(guessNumber)) {
            throw new AlreadyVotedError(
                this.users.find(user => guessNumber === user.number).user
            )
        }

        if (guessNumber > this.range.max || guessNumber < this.range.min) {
            throw new BetOutOfRangeError()
        }

        let user = this.users.find(user => user.user.id === client.id)
        user.number = guessNumber
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

}

//[{user: {}, number: 1}]
