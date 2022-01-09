import {
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
} from 'discord.js'
import { Command, CommandOptions } from '@src/command'
import { Inject, Service } from 'typedi'
import {
    getMemberVoiceChannel,
    getMostPopularVoiceChannel,
} from '@utils/channels.util'
import { Player, STATUS } from '@src/player'
import PlayerService from '@services/player.service'
import GetSongsService from '@services/songs.service'
import {
    AlreadyPlayingError,
    MusicNotFoundError,
    NoSongsFoundError,
    NothingToPlayError,
} from '@src/errors/player.errors'
import { LoggerUtil } from '@utils/logger.util'
import { PlayerProviderFactory } from '@src/factories/player-provider.factory'
import { Queue } from 'queue-typescript'
import { QueuedSong } from '@src/types'
import { addedToQueueEmbed } from '@src/embeds/added.embed'

@Service()
export default class extends Command {
    @Inject()
    private readonly playerService!: PlayerService

    @Inject('queue')
    private readonly queue!: Queue<QueuedSong>

    private channelId!: string
    private addToFrontOfQueue: boolean = false
    private player!: Player

    get options(): CommandOptions {
        return {
            name: ['play', 'p', 'playi', 'pi'],
            signature: {
                command: 'play',
                arguments: ['url'],
            },
            description: 'Clear number of messages',
            category: 'Information',
            requiredPermissions: [],
        }
    }

    public async run(message: Message, args: string[]): Promise<void> {
        await message.suppressEmbeds(true)

        const [targetVoiceChannel] =
            getMemberVoiceChannel(message.member!) ??
            getMostPopularVoiceChannel(message.guild!)

        this.player = this.playerService.get(message.guild!.id)

        const wasPlayingSong = this.queue.front !== null

        if (args.length === 0) {
            if (this.player.status === STATUS.PLAYING) {
                throw new AlreadyPlayingError()
            }

            // Must be resuming play
            if (!wasPlayingSong) {
                throw new NothingToPlayError()
            }

            await this.player.connect(targetVoiceChannel)
            await this.player.play()

            return
        }

        this.addToFrontOfQueue =
            args[args.length - 1] === 'i' ||
            args[args.length - 1] === 'immediate'
        this.channelId = message.channel.id

        const results = await PlayerProviderFactory.create(args[0])

        for (const song of results) {
            const queueSong = { ...song, channelId: this.channelId }

            LoggerUtil.debug('Adding song to the queue.', { song: song.title })

            this.addToFrontOfQueue
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
                await message.channel.send(`Resuming playback.`)
                return
            }
        }

        const firstSong = this.queue.tail

        // Single track added
        if (results.length == 1) {
            if (this.addToFrontOfQueue) {
                await message.reply(
                    `**${firstSong.title}** Added to the front of the queue.`
                )
                return
            }

            await message.reply({
                embeds: [
                    addedToQueueEmbed({
                        queue: this.queue,
                        message: message,
                        music: results[0],
                    }),
                ],
            })

            return
        }

        // Playlist added
        await message.reply(
            `**${results[0].title}** and ${
                results.length - 1
            } other songs were added to the queue.`
        )
    }
}
