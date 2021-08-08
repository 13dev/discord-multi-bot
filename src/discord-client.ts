import Discord, {ClientOptions, PresenceData} from 'discord.js'
import {Service} from 'typedi'

export interface BotSettings {
    presence: PresenceData
    clientOptions?: ClientOptions
    token?: string
    prefix: string
}

@Service()
class DiscordClient extends Discord.Client {
    private static instance: DiscordClient
    public config!: BotSettings

    public setConfig(Config: BotSettings): DiscordClient {
        this.config = Config
        return DiscordClient.instance
    }
}

export default DiscordClient
