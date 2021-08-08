import {Message} from 'discord.js'
import DiscordClient from '@src/discord-client'

export default async (message: Message, client: DiscordClient) => {
    console.log(message)
    await message.reply('ola')
}
