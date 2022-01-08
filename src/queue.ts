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
    channelId: Snowflake
}

type QueuedSongWithoutChannel = Except<QueuedSong, 'channelId'>

@Service()
export class Queue {
    private queue: QueuedSong[] = []
    private _position = 0

    set position(value: number) {
        this._position = value
    }

    get position(): number {
        return this._position
    }

    public getCurrent(): QueuedSong | null {
        if (this.queue[this._position]) {
            return this.queue[this._position]
        }

        return null
    }

    public shuffle(): void {
        const shuffledSongs = shuffle(this.queue.slice(this._position + 1))

        this.queue = [
            ...this.queue.slice(0, this._position + 1),
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
        const insertAt = this._position + 1
        this.queue = [
            ...this.queue.slice(0, insertAt),
            song,
            ...this.queue.slice(insertAt),
        ]
    }

    public size(): number {
        return this.queue.length
    }

    public get(index: number): QueuedSong {
        return this.queue[index]
    }

    public isEmpty(): boolean {
        return this.size() === 0
    }

    public remove(index: number, amount = 1): void {
        this.queue.splice(this._position + index, amount)
    }

    public removeCurrent(): void {
        this.queue = [
            ...this.queue.slice(0, this._position),
            ...this.queue.slice(this._position + 1),
        ]
    }

    public clear(): void {
        const newQueue = []

        // Don't clear curently playing song
        const current = this.getCurrent()

        if (current) {
            newQueue.push(current)
        }

        this._position = 0
        this.queue = newQueue
    }
}
