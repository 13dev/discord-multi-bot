import {BotEvent, EventType} from '@events/index'
import DiscordClient from '@src/discord-client'
import {Logger} from '@utils/logger'


export default class OnReadyEvent implements BotEvent {
    type: EventType = EventType.READY

    constructor(private client: DiscordClient) {
    }

    public async run(): Promise<void> {
        if (this.client.user) {
            Logger.info(`${this.client.user.username} is running.`)

            this.client.user.setPresence(this.client.config.presence)
        }
    }
}
