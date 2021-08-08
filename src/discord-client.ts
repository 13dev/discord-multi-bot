import Discord, {Client, ClientOptions, Collection, PresenceData} from 'discord.js'
import {Command} from '@src/command'
import { Service } from 'typedi'
export interface BotSettings {
    presence: PresenceData
    clientOptions?: ClientOptions
    token?: string
    prefix: string
}
@Service()
class DiscordClient extends Discord.Client {
    private static instance: DiscordClient
    private _commands: Collection<string, Command> = new Collection<string, Command>()
    public config!: BotSettings

    public get commands(): Collection<string, Command> {
        return this._commands
    }

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
