import {Collection} from 'discord.js'
import DiscordClient from '@src/discord-client'
import {settings} from '@src/config'
import {Command} from '@src/command'
import {Logger} from '@utils/logger'
import {BotEvent} from '@src/events'
import events from '@events/index'
import commands from '@commands/index'
import {Container} from 'typedi'

class DiscordLoader {

    public static async load() {
        Logger.info('Initing bot!')
        console.log(events)
        console.log(commands)

        const client = Container.get<DiscordClient>(DiscordClient)


        client.setConfig(settings)
        DiscordClient.setInstance(client)

        this.initializeCommands(client)
        this.initializeEvents(client)

        await client.login(settings.token)

    }

    public static initializeCommands(client: DiscordClient): void {

        commands.forEach(command => {

            const Command = new command(client) as Command
            Logger.info('Command loaded', command)
            client.commands.set(Command.commandOptions.name, Command)

        })
    }

    public static initializeEvents(client: DiscordClient): void {
        events.forEach(event => {
            // @ts-ignore
            const Event = new event(client)

            Logger.info('Event loaded', event)

            client.on(Event.type.toString(), (...args: string[]) => Event.run(args))
        })
    }

}

export default DiscordLoader
