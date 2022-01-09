import { TextChannel, VoiceBasedChannel, VoiceChannel } from 'discord.js'
import { Readable } from 'stream'
import hasha from 'hasha'
import { getInfo, videoInfo } from 'ytdl-core'

import {
    AudioPlayer,
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    DiscordGatewayAdapterCreator,
    joinVoiceChannel,
    StreamType,
    VoiceConnection,
    VoiceConnectionStatus,
} from '@discordjs/voice'
import { Inject, Service } from 'typedi'
import DiscordClient from '@src/adapters/discord.adapter'
import { FfmpegAdapter } from '@src/adapters/ffmpeg.adapter'
import YoutubeAdapter from '@src/adapters/youtube.adapter'
import { Config } from '@src/config'
import { Queue } from 'queue-typescript'
import { QueuedSong } from '@src/types'
import { PlayerError } from '@src/errors/player.errors'

export enum STATUS {
    PLAYING,
    PAUSED,
}
@Service()
export class Player {
    @Inject()
    private readonly discordClient!: DiscordClient

    @Inject('queue')
    private readonly queue!: Queue<QueuedSong>

    @Inject()
    private readonly ffmpegAdapter!: FfmpegAdapter

    @Inject()
    private readonly youtubeAdapter!: YoutubeAdapter

    public status = STATUS.PAUSED
    private voiceConnection: VoiceConnection | null = null
    private audioPlayer: AudioPlayer | null = null
    private nowPlaying: QueuedSong | null = null
    private playPositionInterval: NodeJS.Timeout | undefined
    private lastSongURL = ''
    private positionInSeconds = 0

    public isConnected(): boolean {
        return this.voiceConnection instanceof VoiceConnection
    }

    async connect(channel: VoiceChannel | VoiceBasedChannel): Promise<void> {
        this.voiceConnection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild
                .voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator,
            selfDeaf: true,
            selfMute: false,
        })
    }

    disconnect(): void {
        if (this.voiceConnection) {
            if (this.status === STATUS.PLAYING) {
                this.pause()
            }

            this.voiceConnection.destroy()
            this.audioPlayer?.stop()

            this.voiceConnection = null
            this.audioPlayer = null
        }
    }

    async seek(positionSeconds: number): Promise<void> {
        this.status = STATUS.PAUSED

        if (this.voiceConnection === null) {
            throw new PlayerError('Not connected to a voice channel.')
        }

        const currentSong = this.queue.front

        if (!currentSong) {
            throw new PlayerError('No song currently playing')
        }

        if (positionSeconds > currentSong.length) {
            throw new PlayerError(
                'Seek position is outside the range of the song.'
            )
        }

        const stream = await this.getStream(currentSong.url, {
            seek: positionSeconds,
        })

        this.audioPlayer = createAudioPlayer()
        this.voiceConnection.subscribe(this.audioPlayer)
        this.audioPlayer.play(
            createAudioResource(stream, {
                inputType: StreamType.WebmOpus,
            })
        )
        this.attachListeners()
        this.startTrackingPosition(positionSeconds)

        this.status = STATUS.PLAYING
    }

    async forwardSeek(positionSeconds: number): Promise<void> {
        return this.seek(this.positionInSeconds + positionSeconds)
    }

    getPosition(): number {
        return this.positionInSeconds
    }

    async play(): Promise<void> {
        if (this.voiceConnection === null) {
            throw new PlayerError('Not connected to a voice channel.')
        }

        const currentSong = this.queue.front

        if (!currentSong) {
            throw new PlayerError('Queue empty.')
        }

        // Resume from paused state
        if (
            this.status === STATUS.PAUSED &&
            currentSong.url === this.nowPlaying?.url
        ) {
            if (this.audioPlayer) {
                this.audioPlayer.unpause()
                this.status = STATUS.PLAYING
                this.startTrackingPosition()
                return
            }

            // Was disconnected, need to recreate stream
            if (!currentSong.isLive) {
                return this.seek(this.getPosition())
            }
        }

        try {
            const stream = await this.getStream(currentSong.url)

            this.audioPlayer = createAudioPlayer()
            this.voiceConnection.subscribe(this.audioPlayer)

            this.audioPlayer.play(
                createAudioResource(stream, {
                    inputType: StreamType.WebmOpus,
                })
            )

            this.attachListeners()

            this.status = STATUS.PLAYING
            this.nowPlaying = currentSong

            if (currentSong.url === this.lastSongURL) {
                this.startTrackingPosition()
                return
            }

            // Reset position counter
            this.startTrackingPosition(0)
            this.lastSongURL = currentSong.url
        } catch (error: unknown) {
            console.log(error)
            const currentSong = this.queue.front
            await this.forward(1)

            if (
                (error as { statusCode: number }).statusCode === 410 &&
                currentSong
            ) {
                const channelId = currentSong.channelId

                if (channelId) {
                    await (
                        this.discordClient.channels.cache.get(
                            channelId
                        ) as TextChannel
                    ).send(`${currentSong.title} is unavailable`)
                    return
                }
            }

            throw error
        }
    }

    pause(): void {
        if (this.status !== STATUS.PLAYING) {
            throw new PlayerError('Not currently playing.')
        }

        this.status = STATUS.PAUSED

        if (this.audioPlayer) {
            this.audioPlayer.pause()
        }

        this.stopTrackingPosition()
    }

    async forward(skip: number): Promise<void> {
        this.manualForward(skip)

        if (this.queue.front && this.status !== STATUS.PAUSED) {
            await this.play()
            return
        }

        this.status = STATUS.PAUSED
        this.disconnect()
    }

    manualForward(skip: number): void {
        if (skip >= this.queue.length - 1) {
            throw new PlayerError('No songs in queue to forward to.')
        }

        Array.from({ length: skip }, () => this.queue.dequeue())
    }

    async back(): Promise<void> {
        if (this.queue.length - 1 >= 0) {
            this.positionInSeconds = 0
            this.stopTrackingPosition()

            if (this.status !== STATUS.PAUSED) {
                await this.play()
            }
            return
        }
        throw new PlayerError('No songs in queue to go back to.')
    }

    private getHashForCache(url: string): string {
        return hasha(url)
    }

    private async getStream(
        url: string,
        options: { seek?: number } = {}
    ): Promise<Readable> {
        let shouldCacheVideo = false

        // TODO: CACHE, do not download if is it on cache.
        // Not cached

        const info = await getInfo(url)
        const format = this.youtubeAdapter.chooseNextBestFormat(info.formats)

        // Custom settings for live streams
        if (info.player_response.videoDetails.isLiveContent) {
            this.ffmpegAdapter.pushOptions(
                '-analyzeduration',
                '0',
                '-probesize',
                '32',
                '-flags',
                'low_delay',
                '-fflags',
                'nobuffer'
            )
        }

        if (options.seek) {
            // Change seek position
            this.ffmpegAdapter.pushOptions('-ss', (options.seek + 7).toString())
        }

        // Create stream and pipe to capacitor
        return this.ffmpegAdapter.createStream(format.url)
    }

    private shouldCacheVideo(info: videoInfo, seek: number) {
        // Don't cache livestreams or long videos
        const isLive = info.player_response.videoDetails.isLiveContent
        const videoLength = parseInt(info.videoDetails.lengthSeconds, 10)

        return (
            !isLive && videoLength < Config.cache.maxCacheLengthSeconds && !seek
        )
    }

    private startTrackingPosition(initalPosition?: number): void {
        if (initalPosition !== undefined) {
            this.positionInSeconds = initalPosition
        }

        if (this.playPositionInterval) {
            clearInterval(this.playPositionInterval)
        }

        this.playPositionInterval = setInterval(() => {
            this.positionInSeconds++
        }, 1000)
    }

    private stopTrackingPosition(): void {
        if (this.playPositionInterval) {
            clearInterval(this.playPositionInterval)
        }
    }

    private attachListeners(): void {
        if (!this.voiceConnection) {
            return
        }

        if (
            this.voiceConnection.listeners(VoiceConnectionStatus.Disconnected)
                .length === 0
        ) {
            this.voiceConnection.on(
                VoiceConnectionStatus.Disconnected,
                this.onVoiceConnectionDisconnect.bind(this)
            )
        }

        if (!this.audioPlayer) {
            return
        }

        if (this.audioPlayer.listeners('stateChange').length === 0) {
            this.audioPlayer.on(
                'stateChange',
                this.onAudioPlayerStateChange.bind(this)
            )
        }
    }

    private onVoiceConnectionDisconnect(): void {
        this.disconnect()
    }

    private async onAudioPlayerStateChange(
        oldState: { status: AudioPlayerStatus },
        newState: { status: AudioPlayerStatus }
    ): Promise<void> {
        // Automatically advance queued song at end
        if (
            newState.status === AudioPlayerStatus.Idle &&
            this.status === STATUS.PLAYING
        ) {
            await this.forward(1)
        }
    }
}
