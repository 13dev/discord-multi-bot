import { DMChannel, Message } from 'discord.js'
import { Command, CommandOptions } from '@src/command'
import { Service } from 'typedi'
import { Logger } from '@utils/logger'

@Service()
export default class extends Command {

    get options(): CommandOptions {
        return {
            name: 'clear',
            signature: {
                command: 'clear',
                arguments: ['limit'],
            },
            description: 'Clear number of messages',
            category: 'Information',
            requiredPermissions: [],
        }
    }

    public async run(message: Message, args: string[]): Promise<void> {
        if (message.channel instanceof DMChannel) {
            return
        }

        const limit = Number(args[0])

        if (limit < 0 || limit > 20) {
            await message.reply('Introduz numbero entre 0 - 20.')
            return
        }

        message.channel.bulkDelete(limit + 1).catch((error) => {
            Logger.info('Error deleting messages', { error: error })
            message.reply(`Erro a eliminar mensagens.`)
        })
    }

}
