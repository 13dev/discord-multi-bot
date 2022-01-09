import { SlashCreator } from 'slash-create/lib/creator'
import {
    ButtonStyle,
    CommandContext,
    CommandOptionType,
    ComponentType,
    SlashCommand,
} from 'slash-create'
import { Container } from 'typedi'
import { Queue } from 'queue-typescript'
import { QueuedSong } from '@src/types'
import PlayerService from '@services/player.service'
import { Player } from '@src/player'
import { PlayerProviderFactory } from '@src/factories/player-provider.factory'
import { LoggerUtil } from '@utils/logger.util'
import {
    getMemberVoiceChannel,
    getMostPopularVoiceChannel,
} from '@utils/channels.util'
import { NoSongsFoundError } from '@src/errors/player.errors'

export class PlayCommand extends SlashCommand {
    private readonly queue: Queue<QueuedSong>
    private readonly playerService: PlayerService
    private player!: Player

    constructor(creator: SlashCreator) {
        super(creator, {
            name: 'play',
            description: 'Plays a music',
            deferEphemeral: true,
            options: [
                {
                    type: CommandOptionType.STRING,
                    name: 'url',
                    description: 'Youtube url, spotify, livestream...',
                    required: true,
                },
                {
                    type: CommandOptionType.BOOLEAN,
                    name: 'infront',
                    description: 'Add the music(s) in front of the queue.',
                },
            ],
        })

        this.filePath = __filename
        this.queue = Container.get('queue')
        this.playerService = Container.get(PlayerService)
    }

    async run(ctx: CommandContext) {
        await ctx.defer(true)

        const addInFront = Boolean(ctx.options.infront)
        const wasPlayingSong = this.queue.front !== null

        this.player = this.playerService.get(ctx.guildID!)
        const guild = this.client.guilds.cache.get(ctx.guildID)
        const member =
            guild.members.cache.get(ctx.user.id) ??
            (await guild.members.fetch(ctx.user.id))

        const [targetVoiceChannel] =
            getMemberVoiceChannel(member) ?? getMostPopularVoiceChannel(guild)

        const results = await PlayerProviderFactory.create(ctx.options.url)

        for (const song of results) {
            const queueSong = { ...song, channelId: ctx.channelID }

            LoggerUtil.debug('Adding song to the queue.', { song: song.title })

            addInFront
                ? this.queue.prepend(queueSong)
                : this.queue.enqueue(queueSong)
        }

        if (!this.queue.length) {
            LoggerUtil.debug('No Songs found!', { info: this.queue })
            throw new NoSongsFoundError()
        }

        if (!this.player.isConnected()) {
            await this.player.connect(targetVoiceChannel)

            // Resume / start playback
            await this.player.play()

            if (wasPlayingSong) {
                await ctx.send(`Resuming playback.`)
                return
            }
        }

        const lastSong = this.queue.tail

        // Single track added
        if (results.length == 1) {
            if (!addInFront) {
                await ctx.send(`**${lastSong.title}** Added to the queue.`, {
                    ephemeral: true,
                })
                return
            }

            await ctx.send(
                `**${lastSong.title}** Added to the front of the queue.`,
                { ephemeral: true }
            )
            return
        }

        // Playlist added
        await ctx.send(
            `**${results[0].title}** and ${this.queue.length} other songs were added to the queue`,
            { ephemeral: true }
        )

        // await ctx.send(`${}` + this.queue.length, {
        //     ephemeral: true,
        //     components: [
        //         {
        //             type: ComponentType.ACTION_ROW,
        //             components: [
        //                 {
        //                     type: ComponentType.BUTTON,
        //                     style: ButtonStyle.PRIMARY,
        //                     label: 'button',
        //                     custom_id: 'example_button',
        //                     emoji: {
        //                         name: '👌',
        //                     },
        //                 },
        //             ],
        //         },
        //     ],
        // })
        //
        // ctx.registerComponent('example_button', async (btnCtx) => {
        //     // await a.edit('hello')
        //     // ctx.unregisterComponent('example_button', a.id)
        // })
    }
}
