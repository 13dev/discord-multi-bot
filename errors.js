class AlreadyVotedError extends Error {
    constructor() {
        super()
        this.name = 'AlreadyVotedError'
        this.message = 'This number is already voted, choose another number!'
    }
}

module.exports = {
    AlreadyVotedError,
}
