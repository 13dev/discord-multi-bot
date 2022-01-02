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
import { PlayerQueue, QueuedSong } from '@src/player-queue'

@Service()
export default class extends Command {
    @Inject()
    private readonly playerService!: PlayerService
    private player!: Player

    @Inject()
    private readonly getSongs!: GetSongsService

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

        this.player = this.playerService.get(message.guild!.id)

        const wasPlayingSong = this.player.queue.getCurrent() !== null

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

        let extraMsg = ''

        const [provider, url] = PlayerProviderResolver.resolve(args[0])

        switch (provider) {
            case PlayerProvider.SPOTIFY_PLAYLIST:
                await this.handleSpotifyPlaylist(url.toString())
                break
            case PlayerProvider.SPOTIFY_TRACK:
                await this.handleSpotifyPlaylist(url.toString())
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

        console.log(this.player.queue.size())

        // if (this.player.queue.isEmpty()) {
        //     throw new NoSongsFoundError()
        // }

        const firstSong = this.player.queue.getQueue()[0]

        let statusMsg = ''

        if (this.player.voiceConnection === null) {
            await this.player.connect(targetVoiceChannel)

            // Resume / start playback
            await this.player.play()

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

        if (this.player.queue.size() > 0) {
            await message.channel.send(
                `**${firstSong.title}** added to the${
                    this.addToFrontOfQueue ? ' front of the' : ''
                } queue${extraMsg}`
            )
            return
        }

        await message.channel.send(
            `**${firstSong.title}** and ${
                this.player.queue.size() - 1
            } other songs were added to the queue${extraMsg}`
        )
    }

    private async handleSpotifyPlaylist(url: string) {
        console.log(url)
        const [convertedSongs, nSongsNotFound, totalSongs] =
            await this.getSongs.spotifySource(url, Config.playlistLimit)

        for (const song of convertedSongs) {
            this.player.queue.add(
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
            this.player.queue.add(song as QueuedSong)
        }
    }

    private async handleYoutubeSingleTrack(url: URL) {
        const song = await this.getSongs.youtubeVideo(url.href)

        if (!song) {
            throw new MusicNotFoundError()
        }

        console.log('Addding yt single', song as QueuedSong)

        console.log(this.player.queue)
        this.player.queue.add(song as QueuedSong)

        console.log(this.player.queue)
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

        this.player.queue.add(song as QueuedSong)
    }
}
