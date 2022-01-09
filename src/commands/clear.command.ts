import { DMChannel, Message } from 'discord.js'
import { Command, CommandOptions } from '@src/command'
import { Service } from 'typedi'
import { LoggerUtil } from '@utils/logger.util'

@Service()
export default class extends Command {
    get options(): CommandOptions {
        return {
            name: ['clear', 'c'],
            signature: {
                command: 'clear',
                arguments: ['limit'],
            },
            description: 'Clear number of messages',
            category: 'Information',
            requiredPermissions: [],
        }
    }

    // clear [limit:int]
    // lottery close [limit:int]

    public async run(message: Message, args: string[]): Promise<void> {
        if (message.channel instanceof DMChannel) {
            return
        }

        const limit = Number(args[0])

        if (limit < 0 || limit > 20) {
            await message.reply('Introduz numbero entre 0 - 20.')
            return
        }

        if (!message.channel.partial) {
            message.channel.bulkDelete(limit + 1).catch((error) => {
                LoggerUtil.info('Error deleting messages', { error: error })
                message.reply(`Erro a eliminar mensagens.`)
            })
        }
    }
}
