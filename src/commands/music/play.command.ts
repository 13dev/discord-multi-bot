import { Message } from 'discord.js'
import { Command, CommandOptions } from '@src/command'
import { Inject, Service } from 'typedi'
import {
    getMemberVoiceChannel,
    getMostPopularVoiceChannel,
} from '@utils/channels.util'
import { STATUS } from '@src/player'
import PlayerService from '@services/player.service'
import { Except } from 'type-fest'
import GetSongsService from '@services/songs.service'
import {
    AlreadyPlayingError,
    MusicNotFoundError,
    NoSongsFoundError,
    NothingToPlayError,
} from '@src/errors/player.errors'
import { Config } from '@src/config'
import PlayerProviderResolver, {
    PlayerProvider,
} from '@src/resolvers/player-provider.resolver'
import { PlayerQueue, QueuedSong } from '@src/player-queue'

@Service()
export default class extends Command {
    @Inject()
    private readonly playerService!: PlayerService

    @Inject()
    private readonly getSongs!: GetSongsService

    @Inject()
    private readonly queue!: PlayerQueue

    private channelId!: string
    private addToFrontOfQueue: boolean = false

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

        const player = this.playerService.get(message.guild!.id)

        const wasPlayingSong = this.queue.getCurrent() !== null

        if (args.length === 0) {
            if (player.status === STATUS.PLAYING) {
                throw new AlreadyPlayingError()
            }

            // Must be resuming play
            if (!wasPlayingSong) {
                throw new NothingToPlayError()
            }

            await player.connect(targetVoiceChannel)
            await player.play()

            return
        }

        this.addToFrontOfQueue =
            args[args.length - 1] === 'i' ||
            args[args.length - 1] === 'immediate'

        let extraMsg = ''

        const [provider, url] = PlayerProviderResolver.resolve(args[0])

        switch (provider) {
            case PlayerProvider.SPOTIFY_PLAYLIST:
                await this.handleSpotifyPlaylist(url as string)
                break
            case PlayerProvider.SPOTIFY_TRACK:
                await this.handleSpotifyPlaylist(url as string)
                break
            case PlayerProvider.YOUTUBE_PLAYLIST:
                await this.handleYoutubePlaylist(url as URL)
                break
            case PlayerProvider.YOUTUBE_SINGLE_TRACK:
                await this.handleYoutubeSingleTrack(url as URL)
                break
            case PlayerProvider.YOUTUBE_SEARCH:
                await this.handleYoutubeSearch(url as string, args)
                break
        }

        this.channelId = message.channel.id

        if (!this.queue.size()) {
            throw new NoSongsFoundError()
        }

        const firstSong = this.queue.getQueue()[0]

        let statusMsg = ''

        if (player.voiceConnection === null) {
            await player.connect(targetVoiceChannel)

            // Resume / start playback
            await player.play()

            if (wasPlayingSong) {
                statusMsg = 'resuming playback'
            }
        }

        // Build response message
        if (statusMsg !== '') {
            if (extraMsg === '') {
                extraMsg = statusMsg
            } else {
                extraMsg = `${statusMsg}, ${extraMsg}`
            }
        }

        if (extraMsg !== '') {
            extraMsg = ` (${extraMsg})`
        }

        if (this.queue.size() > 0) {
            await message.channel.send(
                `**${firstSong.title}** added to the${
                    this.addToFrontOfQueue ? ' front of the' : ''
                } queue${extraMsg}`
            )
            return
        }

        await message.channel.send(
            `u betcha, **${firstSong.title}** and ${
                this.queue.size() - 1
            } other songs were added to the queue${extraMsg}`
        )
    }

    private async handleSpotifyPlaylist(url: string) {
        const [convertedSongs, nSongsNotFound, totalSongs] =
            await this.getSongs.spotifySource(url, Config.playlistLimit)

        for (const song of convertedSongs) {
            this.queue.add(
                { ...song, addedInChannelId: this.channelId },
                this.addToFrontOfQueue
            )
        }
    }

    private async handleYoutubePlaylist(url: URL) {
        const songs = await this.getSongs.youtubePlaylist(
            url.searchParams.get('list')!
        )

        for (const song of songs) {
            this.queue.add(song as QueuedSong)
        }
    }

    private async handleYoutubeSingleTrack(url: URL) {
        const song = await this.getSongs.youtubeVideo(url.href)

        if (!song) {
            throw new MusicNotFoundError()
        }

        this.queue.add(song as QueuedSong)
    }

    private async handleYoutubeSearch(url: string, args: string[]) {
        // Not a URL, must search YouTube
        const query = this.addToFrontOfQueue
            ? args.slice(0, args.length - 1).join(' ')
            : args.join(' ')

        const song = await this.getSongs.youtubeVideoSearch(query)

        if (!song) {
            throw new MusicNotFoundError()
        }

        this.queue.add(song as QueuedSong)
    }
}
