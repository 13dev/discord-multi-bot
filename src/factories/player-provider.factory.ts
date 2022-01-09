import {
    PlayerProvider,
    PlayerProviderResolver,
} from '@src/resolvers/player-provider.resolver'
import { Config } from '@src/config'
import { MusicNotFoundError } from '@src/errors/player.errors'
import { Container, Service } from 'typedi'
import GetSongsService from '@services/songs.service'
import { QueuedSong } from '@src/types'

@Service()
export class PlayerProviderFactory {
    public static async create(term: string): Promise<QueuedSong[]> {
        const result: QueuedSong[] = []
        const [provider, url] = PlayerProviderResolver.resolve(term)

        switch (provider) {
            case PlayerProvider.SPOTIFY_PLAYLIST:
                result.push(
                    ...(await this.handleSpotifyPlaylist(url.toString()))
                )
                break
            case PlayerProvider.SPOTIFY_TRACK:
                result.push(
                    ...(await this.handleSpotifyPlaylist(url.toString()))
                )
                break
            case PlayerProvider.YOUTUBE_PLAYLIST:
                result.push(...(await this.handleYoutubePlaylist(url as URL)))
                break
            case PlayerProvider.YOUTUBE_SINGLE_TRACK:
                result.push(await this.handleYoutubeSingleTrack(url as URL))
                break
            case PlayerProvider.YOUTUBE_SEARCH:
                result.push(await this.handleYoutubeSearch(url as string))
                break
        }
        return result
    }

    private static get songsService(): GetSongsService {
        return Container.get<GetSongsService>(GetSongsService)
    }

    private static async handleSpotifyPlaylist(
        url: string
    ): Promise<QueuedSong[]> {
        const [convertedSongs, nSongsNotFound, totalSongs] =
            await this.songsService.spotifySource(url, Config.playlistLimit)

        return convertedSongs as QueuedSong[]
    }

    private static async handleYoutubePlaylist(
        url: URL
    ): Promise<QueuedSong[]> {
        const songs = await this.songsService.youtubePlaylist(
            url.searchParams.get('list')!
        )

        return songs as QueuedSong[]
    }

    private static async handleYoutubeSingleTrack(
        url: URL
    ): Promise<QueuedSong> {
        const song = await this.songsService.youtubeVideo(url.href)

        if (!song) {
            throw new MusicNotFoundError()
        }

        return song as QueuedSong
    }

    private static async handleYoutubeSearch(url: string): Promise<QueuedSong> {
        const song = await this.songsService.youtubeVideoSearch(url)

        if (!song) {
            throw new MusicNotFoundError()
        }

        return song as QueuedSong
    }
}
