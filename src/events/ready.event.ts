import { BotEvent, EventType } from '@events/index'
import { LoggerUtil } from '@utils/logger.util'
import DiscordClient from '@src/adapters/discord.adapter'

export default class ReadyEvent implements BotEvent {
    type: EventType = EventType.READY

    constructor(private client: DiscordClient) {}

    public async run(): Promise<void> {
        if (this.client.user) {
            LoggerUtil.info(`${this.client.user.username} is running.`)

            this.client.user.setPresence(this.client.config.presence)
        }
    }
}
