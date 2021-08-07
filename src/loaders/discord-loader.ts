import {ClientEvents} from 'discord.js'
import Config from '@src/config'
import events from '../events'
import console from '@utils/color-console'
import DiscordClient from '@src/discord'

class DiscordLoader {
    public static async load() {
        console.gray('[DISCORD] Initing Bot')

        const client = new DiscordClient()
        type eventKeys = keyof ClientEvents

        Object.keys(events).forEach((e: eventKeys) => {
            console.gray(`[DISCORD] Adding Event: ${e}`)
            client.on(e, events[e])
        })

        client.setConfig(Config.discord)
        DiscordClient.setInstance(client)

        await client.login(Config.discord.token)
    }
}

export default DiscordLoader
