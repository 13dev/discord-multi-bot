module.exports = class Lottery {
    constructor() {
        this._users = {}
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

    addClient(clientId) {
        if (this._users.hasOwnProperty(clientId.toString())) {
            return false;
        }

        this._users[clientId.toString()] = {};
    }

    addVote(clientId, guessNumber) {
        this._users[clientId.toString()].number = guessNumber;
    }

    startLottery() {
        this._status = true;
    }

    chooseWinner() {
        // do stuff
    }

    isNumberVoted(number) {
        let numbers = Object.values(this.users).map(user => user.number)
        return numbers.includes(number)
    }

}

//[{223: {}}]
