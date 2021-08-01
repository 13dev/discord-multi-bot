module.exports = class OptionsHandler {
    constructor(lottery, listener) {
        this.lottery = lottery
        this.listener = listener
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

    handleVote(number) {
        this.lottery.addUser(this.listener.author)
        this.lottery.bet(this.listener.author, number)
        this.listener.reply('Vote added!')
    }

    handleRange(min, max) {
        if(parseInt(min) > parseInt(max)) {
            this.listener.reply('Minimum value is bigger than max value!')
            return
        }

        this.lottery.minRange = min
        this.lottery.maxRange = max

        this.listener.reply(`Users can now vote between ${min} and ${max}!`)
    }

    handleStartLotery() {
        if(this.lottery.status) {
            this.listener.reply(`Lottery is already open!`)
        }

        this.lottery.start()

        this.listener.channel.send(`@everyone The lottery has begun, good luck!`)
    }
}
