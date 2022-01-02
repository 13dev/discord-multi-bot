import { BotEvent, EventType } from '@events/index'
import { Container as Container1 } from 'typedi'
import CommandResolver from '@src/resolvers/command.resolver'
import UserResolver from '@src/resolvers/user.resolver'
import { USER } from '@utils/consts.util'
import { LoggerUtil } from '@utils/logger.util'
import { createParser, Parser } from 'discord-cmd-parser'
import DiscordClient from '@src/adapters/discord.adapter'
import { DiscordLotteryError } from '@src/errors/lottery.errors'
import { MusicNotFoundError, PlayerError } from '@src/errors/player.errors'

export default class OnReadyEvent implements BotEvent {
    public type: EventType = EventType.MESSAGE

    constructor(private client: DiscordClient, private parser: Parser) {
        this.parser = createParser()
    }

    public async run(args: any): Promise<void> {
        const [message] = args

        if (
            message.author.bot ||
            !message.content.startsWith(this.client.config.prefix)
        )
            return

        const argus = message.content.split(/\s+/g)
        const command = argus.shift()!.slice(this.client.config.prefix.length)

        console.log(command, argus)

        let commandClass = CommandResolver.resolve(command)

        if (!commandClass) {
            // Command not found!
            await message.reply('Command not found!')
            return
        }

        LoggerUtil.info('Calling command.', {
            command: commandClass.options.signature.command,
            args: argus,
        })

        await UserResolver.resolve(message.author).then((user) =>
            Container1.set(USER, user)
        )

        //Verify if the user can actually run this command
        if (!(await commandClass.canRun(message.author, message))) return

        try {
            await commandClass.run(message, argus)
        } catch (error) {
            //We will use the Error message prop to give user feedback what gone wrong.
            if (
                error instanceof DiscordLotteryError ||
                error instanceof PlayerError
            ) {
                message.reply(error.message)
                return
            }

            throw error
        }
    }
}
