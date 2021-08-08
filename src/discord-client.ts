import Discord, {Client, ClientOptions, Collection, PresenceData} from 'discord.js'
import {Command} from '@src/command'

export interface BotSettings {
    presence: PresenceData
    clientOptions?: ClientOptions
    token?: string
    prefix: string
    paths: {
        commands: string
        events: string
    };
}

class DiscordClient extends Discord.Client {
    private static instance: DiscordClient
    commands!: Collection<string, Command>
    public config!: BotSettings

    public static getInstance(): DiscordClient {
        if (!DiscordClient.instance) {
            DiscordClient.instance = new DiscordClient()
        }

        return DiscordClient.instance
    }

    public static setInstance(Client: DiscordClient) {
        DiscordClient.instance = Client
    }

    public setConfig(Config: BotSettings): DiscordClient {
        this.config = Config
        return DiscordClient.instance
    }
}

export default DiscordClient
