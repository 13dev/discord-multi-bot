const {AlreadyVotedError} = require('./errors');

module.exports = class Lottery {
    constructor() {
        this._users = []
        this._status = false
    }

    get status() {
        return this._status
    }

    set status(value) {
        this._status = value
    }

    get users() {
        return this._users
    }

    addClient(client) {
        // user already exists
        if(this._users.find(user => user.user.id === client.id)) {
            return false
        }

        this._users.push({
            user: client,
            number: null,
        })

        return true
    }

    addVote(client, guessNumber) {

        if(!this.status) {
            throw new LotteryCloseError()
        }

        if (this.isNumberVoted(guessNumber)) {
            throw new AlreadyVotedError()
        }

        let user = this._users.find(user => user.user.id === client.id)
        user.number = guessNumber
    }

    startLottery() {
        this._status = true
    }

    chooseWinner() {
        // do stuff
    }

    getNumbers() {
        return Object.values(this.users).map(user => user.number)
    }

    isNumberVoted(number) {
        return this.getNumbers().includes(number)
    }

}

//[{user: {}, number: 1}]
