import {BotEvent, EventType} from '@events/index'
import DiscordClient from '@src/discord-client'
import {Command} from '@src/command'
import {Container} from 'typeorm-typedi-extensions'
import {Container as Container1} from 'typedi'
import CommandResolver from '@src/resolver/command-resolver'
import UserResolver from '@src/resolver/user-resolver'
import {Token} from 'typedi'
import User from '@models/user'
import {USER} from '@utils/consts'
import {DiscordLotteryError} from '@src/errors'

export default class OnReadyEvent implements BotEvent {
    type: EventType = EventType.MESSAGE

    constructor(private client: DiscordClient) {
    }

    public async run(args: any): Promise<void> {
        const [message] = args

        if (message.author.bot || !message.content.startsWith(this.client.config.prefix)) return

        const argus = message.content.split(/\s+/g)
        const command = argus.shift()!.slice(this.client.config.prefix.length)


        const commandClass: typeof Command | undefined = CommandResolver.resolve(command)

        if (commandClass === undefined) {
            return
        }

        await UserResolver.resolve(message.author).then(user => {
            Container1.set(USER, user)
        })

        const cmd: Command = await Container.get(commandClass)

        if (!cmd.canRun(message.author, message)) return

        try {
            await cmd.run(message, argus)
        } catch (error) {
            if (error instanceof DiscordLotteryError) {
                message.reply(error.message)
            }
            throw error
        }

    }
}
