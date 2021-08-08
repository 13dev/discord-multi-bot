import {BotEvent, EventType} from '@events/index'
import DiscordClient from '@src/discord-client'
import {Container, Inject} from 'typedi'

export default class OnReadyEvent implements BotEvent {
    type: EventType = EventType.MESSAGE

    constructor(@Inject() private client: DiscordClient) {
    }

    public async run(args: any): Promise<void> {
        const [message] = args

        if (message.author.bot || !message.content.startsWith(this.client.config.prefix)) return

        const argus = message.content.split(/\s+/g)
        const command = argus.shift()!.slice(this.client.config.prefix.length)
        const cmd = Container.get<typeof command>(command)

        if (!cmd) return
        if (!cmd.canRun(message.author, message)) return

        await cmd.run(message, argus)

        if (message.guild) cmd.setCooldown(message.author, message.guild)
    }
}
