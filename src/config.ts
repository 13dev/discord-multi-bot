import dotenv from 'dotenv'
import { SqliteConnectionOptions } from 'typeorm/browser/driver/sqlite/SqliteConnectionOptions'
import { BotSettings } from '@src/adapters/discord.adapter'

dotenv.config()

export class Config {
    public static readonly cache = {
        dir: 'cache',
        limitBytes: 1000000,
    }
    public static readonly playlistLimit = 20

    public static readonly spotify = {
        clientId: process.env.SPOTIFY_CLIENT_ID || '',
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
    }

    public static readonly database: SqliteConnectionOptions = {
        database: process.env.DATABASE_NAME || 'database2.db',
        type: 'sqlite',
        entities: [__dirname + '/models/*.{js,ts}'],
        synchronize: true,
        logging: true,
    }

    public static readonly discord: BotSettings = {
        presence: {
            activities: [
                {
                    name: '!help for commands',
                    type: 'PLAYING',
                },
            ],
        },
        prefix: process.env.COMMAND_PREFIX || '!',
        token: process.env.DISCORD_TOKEN || '',
    }

    public static readonly youtube = {
        apiKey: process.env.YOUTUBE_API_KEY || '',
        hosts: [
            'www.youtube.com',
            'youtu.be',
            'youtube.com',
            'music.youtube.com',
            'www.music.youtube.com',
        ],
    }

    public static readonly ffmpeg = {
        initOptions: [
            '-reconnect',
            '1',
            '-reconnect_streamed',
            '1',
            '-reconnect_delay_max',
            '5',
        ],
    }
}
