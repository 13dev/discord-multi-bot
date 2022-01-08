import {
    PlayerProvider,
    PlayerProviderResolver,
} from '@src/resolvers/player-provider.resolver'
import { Config } from '@src/config'
import { QueuedSong } from '@src/queue'
import { MusicNotFoundError } from '@src/errors/player.errors'
import { Container, Service } from 'typedi'
import GetSongsService from '@services/songs.service'

@Service()
export class PlayerProviderFactory {
    private static readonly result: QueuedSong[] = []

    public static async create(term: string): Promise<QueuedSong[]> {
        const [provider, url] = PlayerProviderResolver.resolve(term)

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
                await this.handleYoutubeSearch(url as string)
                break
        }

        return this.result
    }

    private static get songsService(): GetSongsService {
        return Container.get<GetSongsService>(GetSongsService)
    }

    private static async handleSpotifyPlaylist(url: string) {
        const [convertedSongs, nSongsNotFound, totalSongs] =
            await this.songsService.spotifySource(url, Config.playlistLimit)

        for (const song of convertedSongs) {
            this.result.push(song as QueuedSong)
        }
    }

    private static async handleYoutubePlaylist(url: URL) {
        const songs = await this.songsService.youtubePlaylist(
            url.searchParams.get('list')!
        )

        for (const song of songs) {
            this.result.push(song as QueuedSong)
        }
    }

    private static async handleYoutubeSingleTrack(url: URL) {
        const song = await this.songsService.youtubeVideo(url.href)

        if (!song) {
            throw new MusicNotFoundError()
        }

        console.log('Addding yt single', song as QueuedSong)
        this.result.push(song as QueuedSong)
    }

    private static async handleYoutubeSearch(url: string) {
        const song = await this.songsService.youtubeVideoSearch(url)

        if (!song) {
            throw new MusicNotFoundError()
        }

        this.result.push(song as QueuedSong)
    }
}
