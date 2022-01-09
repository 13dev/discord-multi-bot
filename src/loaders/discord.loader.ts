import { LoggerUtil } from '@utils/logger.util'
import events from '@events/index'
import { Container } from 'typeorm-typedi-extensions'
import DiscordClient from '@src/adapters/discord.adapter'
import { Config } from '@src/config'

const client = Container.get(DiscordClient)

export default async function discordLoader() {
    LoggerUtil.info('Initing bot!')

    client.setConfig(Config.discord)

    for (const event of events) {
        // @ts-ignore
        const Event = new event(client)

        LoggerUtil.info('Event loaded', event)

        client.on(Event.type.toString(), (...args: string[]) => Event.run(args))
    }

    await client.login(Config.discord.token)
}
