import UserModel from '@models/user.model'

export class DiscordLotteryError extends Error {}

export class AlreadyVotedError extends DiscordLotteryError {
    constructor(user: UserModel) {
        super()
        this.name = 'AlreadyVotedError'
        this.message = `This number is already voted by @${user.name}, choose another number!`
    }
}

export class LotteryClosedError extends DiscordLotteryError {
    constructor(props?: string) {
        super(props)
        this.name = 'LotteryCloseError'
        this.message = 'No lottery open, please try contact administrator.'
    }
}

export class BetOutOfRangeError extends DiscordLotteryError {
    constructor(props?: string) {
        super(props)
        this.name = 'BetOutOfRangeError'
        this.message = 'Choose a number between x and x.'
    }
}

export class LotteryNotFoundError extends DiscordLotteryError {
    constructor(props?: string) {
        super(props)
        this.name = 'LotteryNotFoundError'
        this.message = 'LotteryModel not found, please contact admin.'
    }
}
