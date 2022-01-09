import { CommandContext, CommandOptionType, SlashCommand } from 'slash-create'
import { SlashCreator } from 'slash-create/lib/creator'
import PlayerService from '@services/player.service'
import { Container } from 'typedi'
import { PlayerError } from '@src/errors/player.errors'

export class SkipCommand extends SlashCommand {
    private readonly playerService: PlayerService

    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'skip',
            description: 'Skip music',
            options: [
                {
                    type: CommandOptionType.INTEGER,
                    name: 'number',
                    description: 'Number of tracks',
                    required: false,
                },
            ],
        })

        this.filePath = __filename
        this.playerService = Container.get(PlayerService)
    }
    async run(ctx: CommandContext) {
        await ctx.defer(true)
        let tracksToSkip = 1

        if (ctx.options.number && ctx.options.number > tracksToSkip) {
            tracksToSkip = ctx.options.number
        }

        try {
            await this.playerService.get(ctx.guildID!).forward(tracksToSkip)
        } catch (e: any) {
            if (e instanceof PlayerError) {
                await ctx.send(e.message, { ephemeral: true })
                return
            }

            throw e
        }

        await ctx.send(`**${tracksToSkip}** Song(s) skipped.`, {
            ephemeral: true,
        })
    }
}
