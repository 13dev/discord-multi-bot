import Discord, { ClientOptions, Intents, PresenceData } from 'discord.js'
import { Service } from 'typedi'

export interface BotSettings {
    presence: PresenceData
    clientOptions?: ClientOptions
    token?: string
    prefix: string
    publicKey: string
    applicationID: string
}

@Service()
class DiscordClient extends Discord.Client {
    private static instance: DiscordClient
    public config!: BotSettings
    constructor() {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_BANS,
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
                Intents.FLAGS.GUILD_VOICE_STATES,
                Intents.FLAGS.GUILD_PRESENCES,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Intents.FLAGS.DIRECT_MESSAGES,
                Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
            ],

            partials: [
                'GUILD_MEMBER',
                'MESSAGE',
                'CHANNEL',
                'REACTION',
                'USER',
            ],
        })
    }

    public setConfig(Config: BotSettings): DiscordClient {
        this.config = Config
        return DiscordClient.instance
    }
}

export default DiscordClient
