
import {Message} from 'discord.js'
import LotteryService from '@services/lottery-service'

export enum Options {
    LIST = 'list',
    DUMP = 'dump',
    VOTE = 'vote',
    RANGE = 'range',
    START_LOTERY = 'start',
}

export default class OptionsHandler {
    constructor(private _lottery: LotteryService,
                private _listener: Message) {
    }

    get lottery(): LotteryService {
        return this._lottery
    }

    get listener(): Message {
        return this._listener
    }

    handleList() {
        let output = '\n'

        this.lottery.users.forEach(entry => {
            output += `Username: ${entry.user.username}, Number: ${entry.number} \n`
        })

        this.listener.reply('```' + output + '```')
    }

    handleDump() {
        this.listener.reply('```js ' + JSON.stringify(this.lottery.users) + ' ```')
        console.log(this.lottery.users)
    }

    handleVote(number: number) {

        this.listener.reply('Vote added!')
    }

    handleRange(min: number, max: number) {
        if (min > max) {
            this.listener.reply('Minimum value is bigger than max value!')
            return
        }

        this.lottery.range = {min, max}
        this.listener.reply(`Users can now vote between ${min} and ${max}!`)
    }

    handleStartLotery() {
        if (this.lottery.status) {
            this.listener.reply(`Lottery is already open!`)
        }

        this.lottery.start()

        this.listener.channel.send(`@everyone The lottery has begun, good luck!`)
    }
}
