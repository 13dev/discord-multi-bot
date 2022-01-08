import { Message } from 'discord.js'
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
import { Config } from '@src/config'
import {
    PlayerProviderResolver,
    PlayerProvider,
} from '@src/resolvers/player-provider.resolver'
import { Queue, QueuedSong } from '@src/queue'
import { LoggerUtil } from '@utils/logger.util'
import { PlayerProviderFactory } from '@src/factories/player-provider.factory'

@Service()
export default class extends Command {
    @Inject()
    private readonly playerService!: PlayerService

    @Inject()
    private readonly getSongs!: GetSongsService

    @Inject()
    private readonly queue!: Queue

    private channelId!: string
    private addToFrontOfQueue: boolean = false
    private player!: Player

    get options(): CommandOptions {
        return {
            name: 'play',
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
        const [targetVoiceChannel] =
            getMemberVoiceChannel(message.member!) ??
            getMostPopularVoiceChannel(message.guild!)

        this.player = this.playerService.get(message.guild!.id)

        const wasPlayingSong = this.queue.getCurrent() !== null

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
            this.queue.add(
                { ...song, channelId: this.channelId },
                this.addToFrontOfQueue
            )
        }

        if (this.queue.isEmpty()) {
            LoggerUtil.debug('No Songs found!', { info: this.queue })
            throw new NoSongsFoundError()
        }

        const firstSong = this.queue.get(0)

        let statusMsg = ''

        if (!this.player.isConnected()) {
            await this.player.connect(targetVoiceChannel)

            // Resume / start playback
            await this.player.play()

            if (wasPlayingSong) {
                statusMsg = 'resuming playback'
            }
        }

        // Build response message
        //     if (this.queue.size() > 0) {
        //         await message.channel.send(
        //             `**${firstSong.title}** added to the${
        //                 this.addToFrontOfQueue ? ' front of the' : ''
        //             } queue`
        //         )
        //         return
        //     }
        //
        //     await message.channel.send(
        //         `**${firstSong.title}** and ${
        //             this.queue.size() - 1
        //         } other songs were added to the queue`
        //     )
    }
}
