import DiscordClient from '@src/discord-client'
import {settings} from '@src/config'
import {Logger} from '@utils/logger'
import events from '@events/index'
import {Inject, Service} from 'typedi'
import {Container} from 'typeorm-typedi-extensions'

export default async function discordLoader() {

    const client = Container.get(DiscordClient)
    Logger.info('Initing bot!')

    client.setConfig(settings)

    for (const event of events) {
        // @ts-ignore
        const Event = new event(client)

        Logger.info('Event loaded', event)

        client.on(Event.type.toString(), (...args: string[]) => Event.run(args))
    }

    await client.login(settings.token)

}


