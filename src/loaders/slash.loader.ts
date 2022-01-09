import { GatewayServer, SlashCreator } from 'slash-create'
import path from 'path'
import { Container } from 'typedi'
import DiscordClient from '@src/adapters/discord.adapter'
import { Config } from '@src/config'
import { PlayCommand } from '@src/slash/play.command'
import { SkipCommand } from '@src/slash/skip.command'

export default async function slashLoader() {
    const client = Container.get(DiscordClient)

    const creator = new SlashCreator({
        applicationID: Config.discord.applicationID,
        publicKey: Config.discord.publicKey,
        token: Config.discord.token,
        client,
    })

    console.log({
        applicationID: Config.discord.applicationID,
        publicKey: Config.discord.publicKey,
        token: Config.discord.token,
        client,
    })

    await creator
        .withServer(
            new GatewayServer((handler) =>
                client.ws.on('INTERACTION_CREATE', handler)
            )
        )

        .registerCommand(PlayCommand)
        .registerCommand(SkipCommand)
        .syncCommands()

    creator.on('error', (e) => console.log(e))
    creator.on('debug', (e) => console.log(e))
    creator.on('synced', () => console.log('syn'))
    creator.on('commandRegister', (command) =>
        console.info(`Registered command ${command.commandName}`)
    )

    creator.on('warn', (message) => console.warn(message))
}
