import { Inject, Service } from 'typedi'
import { Command, CommandOptions } from '@src/command'
import PlayerService from '@services/player.service'
import { Message } from 'discord.js'

@Service()
export default class extends Command {
    @Inject()
    private readonly playerService!: PlayerService

    get options(): CommandOptions {
        return {
            name: ['skip', 's'],
            signature: {
                command: 'skip',
            },
            description: 'Skip the current sound',
            category: 'Music',
            requiredPermissions: [],
        }
    }

    public async run(message: Message, args: string[]): Promise<void> {
        let tracksToSkip = 1

        if (args.length) {
            tracksToSkip = Number(args[0])
        }

        await this.playerService.get(message.guild!.id).forward(tracksToSkip)
    }
}
