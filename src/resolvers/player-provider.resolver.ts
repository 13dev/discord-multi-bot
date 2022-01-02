import { Command } from '@src/command'
import { Config } from '@src/config'

export enum PlayerProvider {
    YOUTUBE_SINGLE_TRACK,
    YOUTUBE_PLAYLIST,
    SPOTIFY_TRACK,
    SPOTIFY_PLAYLIST,
    YOUTUBE_SEARCH,
}

export type PlayerProviderHandler = (url: URL | string) => void

export default class PlayerProviderResolver {
    static providersHandlers = new Map<PlayerProvider, PlayerProviderHandler>()

    public static resolve(rawUrl: string): [PlayerProvider, URL | string] {
        try {
            const url = new URL(rawUrl)

            if (Config.youtube.hosts.includes(url.host)) {
                if (url.searchParams.get('list')) {
                    return [PlayerProvider.YOUTUBE_PLAYLIST, url]
                }

                return [PlayerProvider.YOUTUBE_SINGLE_TRACK, url]
            }

            if (
                url.protocol === 'spotify:' ||
                url.host === 'open.spotify.com'
            ) {
                return [PlayerProvider.SPOTIFY_PLAYLIST, url]
            }
        } catch (e) {
            // If we cant parse the url search the string in youtube
            return [PlayerProvider.YOUTUBE_SEARCH, rawUrl]
        }

        return [PlayerProvider.YOUTUBE_SEARCH, rawUrl]
    }

    public static add(
        provider: PlayerProvider,
        callback: PlayerProviderHandler
    ): void {}

    private static executeHandler(provider: PlayerProvider, url: URL | string) {
        const callback = PlayerProviderResolver.providersHandlers.get(provider)

        if (!callback) {
            throw new Error(
                'Callback for ' + provider.toString() + 'does not exists'
            )
        }

        callback(url)
    }
}
