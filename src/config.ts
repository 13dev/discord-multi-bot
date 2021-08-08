import dotenv from 'dotenv'
import {BotSettings} from '@src/discord-client'
import {SqliteConnectionOptions} from 'typeorm/browser/driver/sqlite/SqliteConnectionOptions'

dotenv.config()

export const settings: BotSettings = {
    presence: {
        activity: {
            name: '!help for commands',
            type: 'PLAYING'
        }
    },
    prefix: process.env.PREFIX || '-',
    token: process.env.TOKEN || '',
}

export const database: SqliteConnectionOptions = {
    database: 'database1.db',
    type: 'sqlite',
}
