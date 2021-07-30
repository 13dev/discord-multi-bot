class AlreadyVotedError extends Error {
    constructor() {
        super()
        this.name = 'AlreadyVotedError'
        this.message = 'This number is already voted, choose another number!'
    }
}

class LotteryCloseError extends Error {
    constructor(props) {
        super(props)
        this.name = 'LotteryCloseError'
        this.message = 'No lottery open, please try contact administrator.'
    }

}

module.exports = {
    AlreadyVotedError,
}
