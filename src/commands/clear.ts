import { DMChannel, Message } from 'discord.js'
import { Command } from '@src/command'
import DiscordClient from '@src/discord-client'
import { Service } from 'typedi'

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

        message.channel
            .bulkDelete(parseInt(args[0]))
            .catch((error) =>
                message.reply(`Erro a eliminar mensagens: ${error}`)
            )
    }
}
