import { Config } from '@src/config'

export enum PlayerProvider {
    YOUTUBE_SINGLE_TRACK,
    YOUTUBE_PLAYLIST,
    SPOTIFY_TRACK,
    SPOTIFY_PLAYLIST,
    YOUTUBE_SEARCH,
}

export class PlayerProviderResolver {
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
}
