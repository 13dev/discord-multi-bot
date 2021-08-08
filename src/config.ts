import dotenv from 'dotenv'
import {BotSettings} from '@src/discord-client'
dotenv.config()

export const settings: BotSettings = {
    presence: {
        activity: {
            name: '!help for commands',
            type: 'PLAYING'
        }
    },
    prefix: process.env.PREFIX || '-',
    paths: {
        commands: 'src/commands',
        events: 'src/events',
    },
    token: process.env.TOKEN || '',
}
