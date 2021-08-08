import {ClientEvents} from 'discord.js'
import Config from '@src/config'
import events from '@events/index'
import consolec from '@utils/color-console'
import DiscordClient from '@src/discord-client'

class DiscordLoader {

    public static async load() {
        consolec.gray('[DISCORD] Initing Bot');

        const client = new DiscordClient();
        type eventKeys = keyof ClientEvents;

ClientEvents

        client.setConfig(Config.discord);
        DiscordClient.setInstance(client);

        await client.login(Config.discord.token);

        // Add Discord Event Handlers
        // @ts-ignore
        await Object.keys(events).forEach((e: eventKeys) => {
            consolec.gray(`[DISCORD] Adding Event: ${e}`);
            // @ts-ignore
            let functions = Object.values(events[e])



            functions.forEach(a => {
                console.log(e)
                // @ts-ignore
                client.on(e, a)
            })
        });
    }

    // public static async load() {
    //     consolec.gray('[DISCORD] Initing Bot')
    //
    //     const client = new DiscordClient()
    //     let allEvents = Object.keys(events) as Array<keyof ClientEvents>
    //     allEvents.forEach((value: keyof ClientEvents) => {
    //         consolec.gray(`[DISCORD] Adding Event: ${value}`)
    //         // @ts-ignore
    //         let functions = Object.values(events[value])
    //         // @ts-ignore
    //         functions.forEach(a => client.on(value, a))
    //         // @ts-ignore
    //         //client.on(value, events[value])
    //     })
    //
    //     client.setConfig(Config.discord)
    //     DiscordClient.setInstance(client)
    //
    //     await client.login(Config.discord.token)
    // }
}

export default DiscordLoader
