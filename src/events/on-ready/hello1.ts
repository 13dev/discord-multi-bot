import {Message} from 'discord.js'
import DiscordClient from '@src/discord-client'
const handler =  async (message: Message, client: DiscordClient) => {
    message.reply('ola')
}
export default handler
