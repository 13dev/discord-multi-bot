import { VoiceChannel, Snowflake, TextChannel } from 'discord.js'
import { Readable } from 'stream'
import hasha from 'hasha'
import ytdl from 'ytdl-core'
import { WriteStream } from 'fs-capacitor'
import ffmpeg from 'fluent-ffmpeg'

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
import { path } from '@ffmpeg-installer/ffmpeg'
import DiscordClient from '@src/adapters/discord.adapter'
import { PlayerQueue, QueuedSong } from '@src/player-queue'

export enum STATUS {
    PLAYING,
    PAUSED,
}

@Service()
export class Player {
    public status = STATUS.PAUSED
    public voiceConnection: VoiceConnection | null = null
    private audioPlayer: AudioPlayer | null = null
    private nowPlaying: QueuedSong | null = null
    private playPositionInterval: NodeJS.Timeout | undefined
    private lastSongURL = ''
    private positionInSeconds = 0

    @Inject()
    private readonly discordClient!: DiscordClient

    @Inject()
    private readonly _queue!: PlayerQueue

    get queue(): PlayerQueue {
        return this._queue
    }

    constructor() {
        ffmpeg.setFfmpegPath(path)
    }

    async connect(channel: VoiceChannel): Promise<void> {
        this.voiceConnection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild
                .voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator,
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
            throw new Error('Not connected to a voice channel.')
        }

        const currentSong = this._queue.getCurrent()

        if (!currentSong) {
            throw new Error('No song currently playing')
        }

        if (positionSeconds > currentSong.length) {
            throw new Error('Seek position is outside the range of the song.')
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
            throw new Error('Not connected to a voice channel.')
        }

        const currentSong = this._queue.getCurrent()

        if (!currentSong) {
            throw new Error('Queue empty.')
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
            } else {
                // Reset position counter
                this.startTrackingPosition(0)
                this.lastSongURL = currentSong.url
            }
        } catch (error: unknown) {
            const currentSong = this._queue.getCurrent()
            await this.forward(1)

            if (
                (error as { statusCode: number }).statusCode === 410 &&
                currentSong
            ) {
                const channelId = currentSong.addedInChannelId

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
            throw new Error('Not currently playing.')
        }

        this.status = STATUS.PAUSED

        if (this.audioPlayer) {
            this.audioPlayer.pause()
        }

        this.stopTrackingPosition()
    }

    async forward(skip: number): Promise<void> {
        this.manualForward(skip)

        try {
            if (this._queue.getCurrent() && this.status !== STATUS.PAUSED) {
                await this.play()
            } else {
                this.status = STATUS.PAUSED
                this.disconnect()
            }
        } catch (error: unknown) {
            this._queue.position--
            throw error
        }
    }

    manualForward(skip: number): void {
        if (this._queue.position + skip - 1 < this._queue.size()) {
            this._queue.position += skip
            this.positionInSeconds = 0
            this.stopTrackingPosition()
        } else {
            throw new Error('No songs in queue to forward to.')
        }
    }

    async back(): Promise<void> {
        if (this._queue.position - 1 >= 0) {
            this._queue.position--
            this.positionInSeconds = 0
            this.stopTrackingPosition()

            if (this.status !== STATUS.PAUSED) {
                await this.play()
            }
        } else {
            throw new Error('No songs in queue to go back to.')
        }
    }

    private getHashForCache(url: string): string {
        return hasha(url)
    }

    private async getStream(
        url: string,
        options: { seek?: number } = {}
    ): Promise<Readable> {
        let ffmpegInput = ''
        const ffmpegInputOptions: string[] = []
        let shouldCacheVideo = false

        let format: ytdl.videoFormat | undefined

        // try {
        //     // ffmpegInput = await this.fileCache.getPathFor(
        //     //     this.getHashForCache(url)
        //     // )
        //
        //     if (options.seek) {
        //         ffmpegInputOptions.push('-ss', options.seek.toString())
        //     }
        // } catch {
        // Not yet cached, must download
        const info = await ytdl.getInfo(url)

        const { formats } = info

        const filter = (format: ytdl.videoFormat): boolean =>
            format.codecs === 'opus' &&
            format.container === 'webm' &&
            format.audioSampleRate !== undefined &&
            parseInt(format.audioSampleRate, 10) === 48000

        format = formats.find(filter)

        const nextBestFormat = (
            formats: ytdl.videoFormat[]
        ): ytdl.videoFormat | undefined => {
            if (formats[0].isLive) {
                formats = formats.sort(
                    (a, b) =>
                        (b as unknown as { audioBitrate: number })
                            .audioBitrate -
                        (a as unknown as { audioBitrate: number }).audioBitrate
                ) // Bad typings

                return formats.find((format) =>
                    [128, 127, 120, 96, 95, 94, 93].includes(
                        parseInt(format.itag as unknown as string, 10)
                    )
                ) // Bad typings
            }

            formats = formats
                .filter((format) => format.averageBitrate)
                .sort((a, b) => {
                    if (a && b) {
                        return b.averageBitrate! - a.averageBitrate!
                    }

                    return 0
                })
            return formats.find((format) => !format.bitrate) ?? formats[0]
        }

        if (!format) {
            format = nextBestFormat(info.formats)

            if (!format) {
                // If still no format is found, throw
                throw new Error("Can't find suitable format.")
            }
        }

        ffmpegInput = format.url

        // Don't cache livestreams or long videos
        const MAX_CACHE_LENGTH_SECONDS = 30 * 60 // 30 minutes
        shouldCacheVideo =
            !info.player_response.videoDetails.isLiveContent &&
            parseInt(info.videoDetails.lengthSeconds, 10) <
                MAX_CACHE_LENGTH_SECONDS &&
            !options.seek

        ffmpegInputOptions.push(
            ...[
                '-reconnect',
                '1',
                '-reconnect_streamed',
                '1',
                '-reconnect_delay_max',
                '5',
            ]
        )

        if (options.seek) {
            // Fudge seek position since FFMPEG doesn't do a great job
            ffmpegInputOptions.push('-ss', (options.seek + 7).toString())
        }
        //}

        // Create stream and pipe to capacitor
        return new Promise((resolve, reject) => {
            const capacitor = new WriteStream()

            // Cache video if necessary
            // if (shouldCacheVideo) {
            //     const cacheStream = this.fileCache.createWriteStream(
            //         this.getHashForCache(url)
            //     )
            //
            //     capacitor.createReadStream().pipe(cacheStream)
            // } else {
            ffmpegInputOptions.push('-re')
            //}

            const youtubeStream = ffmpeg(ffmpegInput)
                .inputOptions(ffmpegInputOptions)
                .noVideo()
                .audioCodec('libopus')
                .outputFormat('webm')
                .on('error', (error) => {
                    console.error(error)
                    reject(error)
                })

            youtubeStream.pipe(capacitor)

            resolve(capacitor.createReadStream())
        })
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
        _oldState: { status: AudioPlayerStatus },
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
