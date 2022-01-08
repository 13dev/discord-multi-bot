import { Snowflake } from 'discord.js'
import { Except } from 'type-fest'

export interface QueuedPlaylist {
    title: string
    source: string
}

export interface QueuedSong {
    title: string
    artist: string
    url: string
    length: number
    playlist: QueuedPlaylist | null
    isLive: boolean
    channelId: Snowflake
}

export type QueuedSongWithoutChannel = Except<QueuedSong, 'channelId'>
