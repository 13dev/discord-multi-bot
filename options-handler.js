module.exports = class OptionsHandler {
    constructor(lotteryInstance, listener) {
        this.lotteryInstance = lotteryInstance
        this.listener = listener
    }

    handleList() {
        let output = '\n'

        this.lotteryInstance.users.forEach(entry => {
            output += `Username: ${entry.user.username}, Number: ${entry.number} \n`
        })

        this.listener.reply('```' + output + '```')
    }

    handleDump() {
        this.listener.reply('```js ' + JSON.stringify(this.lotteryInstance.users) + ' ```')
        console.log(this.lotteryInstance.users)
    }

    handleVote(number) {
        this.lotteryInstance.addClient(this.listener.author)
        this.lotteryInstance.addVote(this.listener.author, number)
    }

    handleRange(min, max) {
        if(min > max) {
            this.listener.reply('Minimum value is bigger than max value!')
            return
        }

        this.lotteryInstance.minRange(min)
        this.lotteryInstance.maxRange(max)

        this.listener.reply(`Users can now vote between ${min} and ${max}!`)
    }
}
