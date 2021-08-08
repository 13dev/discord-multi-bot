import Discord from 'discord.js'

interface DiscordConfig {
    token: string,
    serverId: string,
    warnChannelId: string,
    statusMessage: string,
    commandPrefix: string,
}

class DiscordClient extends Discord.Client {
    private static instance: DiscordClient

    public config!: DiscordConfig

    public static getInstance(): DiscordClient {
        if (!DiscordClient.instance) {
            DiscordClient.instance = new DiscordClient()
        }

        return DiscordClient.instance
    }

    public static setInstance(Client: DiscordClient) {
        DiscordClient.instance = Client
    }

    public setConfig(Config: DiscordConfig): DiscordClient {
        this.config = Config
        return DiscordClient.instance
    }
}

export default DiscordClient
