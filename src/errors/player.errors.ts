export class PlayerError extends Error {}

export class AlreadyPlayingError extends PlayerError {
    constructor(props?: string) {
        super(props)
        this.name = 'AlreadyPlayingError'
        this.message = 'Already playing, give me a song name'
    }
}

export class NothingToPlayError extends PlayerError {
    constructor(props?: string) {
        super(props)
        this.name = 'NothingToPlayError'
        this.message = 'Nothing to play!'
    }
}

export class MusicNotFoundError extends PlayerError {
    constructor(props?: string) {
        super(props)
        this.name = 'MusicNotFoundError'
        this.message = 'This music dosent exists!'
    }
}

export class NoSongsFoundError extends PlayerError {
    constructor(props?: string) {
        super(props)
        this.name = 'NoSongsFoundError'
        this.message = 'No songs found!'
    }
}
