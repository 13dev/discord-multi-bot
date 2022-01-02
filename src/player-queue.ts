import { Service } from 'typedi'
import shuffle from 'array-shuffle'
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
    addedInChannelId: Snowflake
}

type QueuedSongWithoutChannel = Except<QueuedSong, 'addedInChannelId'>

@Service()
export class PlayerQueue {
    private queue: QueuedSong[] = []
    private queuePosition = 0

    public getCurrent(): QueuedSong | null {
        if (this.queue[this.queuePosition]) {
            return this.queue[this.queuePosition]
        }

        return null
    }

    public shuffle(): void {
        const shuffledSongs = shuffle(this.queue.slice(this.queuePosition + 1))

        this.queue = [
            ...this.queue.slice(0, this.queuePosition + 1),
            ...shuffledSongs,
        ]
    }

    public add(song: QueuedSong, immediate: boolean = false): void {
        if (song.playlist || !immediate) {
            // Add to end of queue
            this.queue.push(song)
            return
        }

        // Add as the next song to be played
        const insertAt = this.queuePosition + 1
        this.queue = [
            ...this.queue.slice(0, insertAt),
            song,
            ...this.queue.slice(insertAt),
        ]
    }

    /**
     * Returns queue, not including the current song.
     * @returns {QueuedSong[]}
     */
    public getQueue(): QueuedSong[] {
        return this.queue.slice(this.queuePosition + 1)
    }

    public size(): number {
        return this.getQueue().length
    }

    public isEmpty(): boolean {
        return this.size() === 0
    }

    public remove(index: number, amount = 1): void {
        this.queue.splice(this.queuePosition + index, amount)
    }

    public removeCurrent(): void {
        this.queue = [
            ...this.queue.slice(0, this.queuePosition),
            ...this.queue.slice(this.queuePosition + 1),
        ]
    }

    public clear(): void {
        const newQueue = []

        // Don't clear curently playing song
        const current = this.getCurrent()

        if (current) {
            newQueue.push(current)
        }

        this.queuePosition = 0
        this.queue = newQueue
    }
}
