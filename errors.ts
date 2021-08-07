export class AlreadyVotedError extends Error {
    constructor(user: { username: string }) {
        super()
        this.name = 'AlreadyVotedError'
        this.message = `This number is already voted by @${user.username}, choose another number!`
    }
}

export class LotteryClosedError extends Error {
    constructor(props: string) {
        super(props)
        this.name = 'LotteryCloseError'
        this.message = 'No lottery open, please try contact administrator.'
    }

}

export class BetOutOfRangeError extends Error {
    constructor(props: string) {
        super(props)
        this.name = 'BetOutOfRangeError'
        this.message = 'Choose a number between x and x.'
    }
}
