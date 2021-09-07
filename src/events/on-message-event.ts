import {BotEvent, EventType} from '@events/index'
import DiscordClient from '@src/discord-client'
import {Container as Container1} from 'typedi'
import CommandResolver from '@src/resolver/command-resolver'
import UserResolver from '@src/resolver/user-resolver'
import {USER} from '@utils/consts'
import {DiscordLotteryError} from '@src/errors'
import {Logger} from '@utils/logger'

export default class OnReadyEvent implements BotEvent {
    type: EventType = EventType.MESSAGE

    constructor(private client: DiscordClient) {
    }

    public async run(args: any): Promise<void> {
        const [message] = args

        if (message.author.bot || !message.content.startsWith(this.client.config.prefix)) return

        const argus = message.content.split(/\s+/g)
        const command = argus.shift()!.slice(this.client.config.prefix.length)
        const commandGroup = argus.shift() || ''

        const commandClass = CommandResolver.resolve(commandGroup + '_' + command)

        if (!commandClass) {
            return
        }

        Logger.info('Calling command class: ' +  commandClass.constructor.name + ' - arguments: ' + argus)
        await UserResolver
            .resolve(message.author)
            .then(user => Container1.set(USER, user))

        //Verify if the user can actually run this command
        if (!(await commandClass.canRun(message.author, message))) return

        try {
            await commandClass.run(message, argus)
        } catch (error) {

            //We will use the Error message prop to give user feedback what gone wrong.
            if (error instanceof DiscordLotteryError) {
                message.reply(error.message)
                return
            }

            throw error
        }

    }
}
