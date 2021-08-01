class AlreadyVotedError extends Error {
    constructor(user) {
        super()
        this.name = 'AlreadyVotedError'
        this.message = `This number is already voted by @${user.username}, choose another number!`
    }
}

class LotteryClosedError extends Error {
    constructor(props) {
        super(props)
        this.name = 'LotteryCloseError'
        this.message = 'No lottery open, please try contact administrator.'
    }

}

class BetOutOfRangeError extends Error {
    constructor(props) {
        super(props)
        this.name = 'BetOutOfRangeError'
        this.message = 'Choose a number between x and x.'
    }

}

module.exports = {
    AlreadyVotedError,
    LotteryClosedError,
    BetOutOfRangeError,
}
