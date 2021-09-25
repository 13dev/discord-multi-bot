import { DMChannel, Message } from 'discord.js'
import { Command } from '@src/command'
import DiscordClient from '@src/discord-client'
import { Service } from 'typedi'
import { Logger } from '@utils/logger'

@Service()
export default class extends Command {
    constructor(client: DiscordClient) {
        super(client, {
            name: 'clear',
            description: 'Clear number of messages',
            category: 'Information',
            requiredPermissions: [],
        })
    }

    public async run(message: Message, args: string[]): Promise<void> {
        if (message.channel instanceof DMChannel) {
            return
        }
        const limit = Number(args[0]) + 1

        if (limit < 0 || limit > 20) {
            await message.reply('Introduz numbero entre 0 - 20.')
            return
        }

        message.channel.bulkDelete(limit).catch((error) => {
            Logger.info('Error deleting messages', { error: error })
            message.reply(`Erro a eliminar mensagens.`)
        })
    }
}
