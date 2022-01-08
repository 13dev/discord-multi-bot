import { URL } from 'url'
import { toSeconds, parse } from 'iso8601-duration'
import got from 'got'
import ytsr, { Video } from 'ytsr'
import spotifyURI from 'spotify-uri'
import Spotify from 'spotify-web-api-node'
import YouTube, { YoutubePlaylistItem } from 'youtube.ts'
import PQueue from 'p-queue'
import shuffle from 'array-shuffle'
import { Except } from 'type-fest'
import { cleanUrl } from '@utils/url.util'
import { Inject, Service } from 'typedi'
import { Config } from '@src/config'
import YoutubeAdapter from '@src/adapters/youtube.adapter'
import SpotifyAdapter from '@src/adapters/spotify.adapter'
import { QueuedPlaylist, QueuedSong } from '@src/queue'

type QueuedSongWithoutChannel = Except<QueuedSong, 'channelId'>

const ONE_HOUR_IN_SECONDS = 60 * 60
const ONE_MINUTE_IN_SECONDS = 1 * 60

@Service()
export default class GetSongsService {
    @Inject()
    private readonly youtubeAdapter!: YoutubeAdapter

    @Inject()
    private readonly spotifyAdapter!: SpotifyAdapter

    private readonly ytsrQueue: PQueue

    constructor() {
        this.ytsrQueue = new PQueue({ concurrency: 4 })
    }

    async youtubeVideoSearch(
        query: string
    ): Promise<QueuedSongWithoutChannel | null> {
        try {
            const { items } = await this.ytsrQueue.add(async () => ytsr(query))

            let firstVideo: Video | undefined

            for (const item of items) {
                if (item.type === 'video') {
                    firstVideo = item
                    break
                }
            }

            if (!firstVideo) {
                throw new Error('No video found.')
            }

            return await this.youtubeVideo(firstVideo.id)
        } catch (_: unknown) {
            return null
        }
    }

    async youtubeVideo(url: string): Promise<QueuedSongWithoutChannel | null> {
        try {
            const videoDetails = await this.youtubeAdapter.videos.get(
                cleanUrl(url)
            )

            return {
                title: videoDetails.snippet.title,
                artist: videoDetails.snippet.channelTitle,
                length: toSeconds(parse(videoDetails.contentDetails.duration)),
                url: videoDetails.id,
                playlist: null,
                isLive: videoDetails.snippet.liveBroadcastContent === 'live',
            }
        } catch (_: unknown) {
            return null
        }
    }

    async youtubePlaylist(listId: string): Promise<QueuedSongWithoutChannel[]> {
        // YouTube playlist
        const playlist = await this.youtubeAdapter.playlists.get(listId)

        interface VideoDetailsResponse {
            id: string
            contentDetails: {
                videoId: string
                duration: string
            }
        }

        const playlistVideos: YoutubePlaylistItem[] = []
        const videoDetailsPromises: Array<Promise<void>> = []
        const videoDetails: VideoDetailsResponse[] = []

        let nextToken: string | undefined

        while (playlistVideos.length !== playlist.contentDetails.itemCount) {
            // eslint-disable-next-line no-await-in-loop
            const { items, nextPageToken } =
                await this.youtubeAdapter.playlists.items(listId)

            nextToken = nextPageToken

            playlistVideos.push(...items)

            // Start fetching extra details about videos
            videoDetailsPromises.push(
                (async () => {
                    // Unfortunately, package doesn't provide a method for this
                    const p = {
                        searchParams: {
                            part: 'contentDetails',
                            id: items
                                .map((item) => item.contentDetails.videoId)
                                .join(','),
                            key: Config.youtube.apiKey,
                            responseType: 'json',
                        },
                    }
                    const { items: videoDetailItems } = await (got(
                        'https://www.googleapis.com/youtube/v3/videos',
                        p
                    ).json() as Promise<{
                        items: VideoDetailsResponse[]
                    }>)

                    videoDetails.push(...videoDetailItems)
                })()
            )
        }

        await Promise.all(videoDetailsPromises)

        const queuedPlaylist = {
            title: playlist.snippet.title,
            source: playlist.id,
        }

        const songsToReturn: QueuedSongWithoutChannel[] = []

        for (const video of playlistVideos) {
            try {
                const length = toSeconds(
                    parse(
                        videoDetails.find(
                            (i: { id: string }) =>
                                i.id === video.contentDetails.videoId
                        )!.contentDetails.duration
                    )
                )

                songsToReturn.push({
                    title: video.snippet.title,
                    artist: video.snippet.channelTitle,
                    length,
                    url: video.contentDetails.videoId,
                    playlist: queuedPlaylist,
                    isLive: false,
                })
            } catch (_: unknown) {
                // Private and deleted videos are sometimes in playlists, duration of these is not returned and they should not be added to the queue.
            }
        }

        return songsToReturn
    }

    async spotifySource(
        url: string,
        playlistLimit: number
    ): Promise<[QueuedSongWithoutChannel[], number, number]> {
        const parsed = spotifyURI.parse(url)

        let tracks: SpotifyApi.TrackObjectSimplified[] = []

        let playlist: QueuedPlaylist | null = null

        switch (parsed.type) {
            case 'album': {
                const uri = parsed as spotifyURI.Album

                const [
                    { body: album },
                    {
                        body: { items },
                    },
                ] = await Promise.all([
                    this.spotifyAdapter.getAlbum(uri.id),
                    this.spotifyAdapter.getAlbumTracks(uri.id, {
                        limit: 50,
                    }),
                ])

                tracks.push(...items)

                playlist = { title: album.name, source: album.href }
                break
            }

            case 'playlist': {
                const uri = parsed as spotifyURI.Playlist

                let [{ body: playlistResponse }, { body: tracksResponse }] =
                    await Promise.all([
                        this.spotifyAdapter.getPlaylist(uri.id),
                        this.spotifyAdapter.getPlaylistTracks(uri.id, {
                            limit: 50,
                        }),
                    ])

                playlist = {
                    title: playlistResponse.name,
                    source: playlistResponse.href,
                }

                tracks.push(
                    ...tracksResponse.items.map(
                        (playlistItem) => playlistItem.track
                    )
                )

                while (tracksResponse.next) {
                    // eslint-disable-next-line no-await-in-loop
                    ;({ body: tracksResponse } =
                        await this.spotifyAdapter.getPlaylistTracks(uri.id, {
                            limit: parseInt(
                                new URL(tracksResponse.next).searchParams.get(
                                    'limit'
                                ) ?? '50',
                                10
                            ),
                            offset: parseInt(
                                new URL(tracksResponse.next).searchParams.get(
                                    'offset'
                                ) ?? '0',
                                10
                            ),
                        }))

                    tracks.push(
                        ...tracksResponse.items.map(
                            (playlistItem) => playlistItem.track
                        )
                    )
                }

                break
            }

            case 'track': {
                const uri = parsed as spotifyURI.Track

                const { body } = await this.spotifyAdapter.getTrack(uri.id)

                tracks.push(body)
                break
            }

            case 'artist': {
                const uri = parsed as spotifyURI.Artist

                const { body } = await this.spotifyAdapter.getArtistTopTracks(
                    uri.id,
                    'US'
                )

                tracks.push(...body.tracks)
                break
            }

            default: {
                return [[], 0, 0]
            }
        }

        // Get random songs if the playlist is larger than limit
        const originalNSongs = tracks.length

        if (tracks.length > playlistLimit) {
            const shuffled = shuffle(tracks)

            tracks = shuffled.slice(0, playlistLimit)
        }

        let songs = await Promise.all(
            tracks.map(async (track) => this.spotifyToYouTube(track, playlist))
        )

        let nSongsNotFound = 0

        // Get rid of null values
        songs = songs.reduce((accum: QueuedSongWithoutChannel[], song) => {
            if (song) {
                accum.push(song)
            } else {
                nSongsNotFound++
            }

            return accum
        }, [])

        return [
            songs as QueuedSongWithoutChannel[],
            nSongsNotFound,
            originalNSongs,
        ]
    }

    private async spotifyToYouTube(
        track: SpotifyApi.TrackObjectSimplified,
        _: QueuedPlaylist | null
    ): Promise<QueuedSongWithoutChannel | null> {
        try {
            return await this.youtubeVideoSearch(
                `"${track.name}" "${track.artists[0].name}"`
            )
        } catch (_: unknown) {
            return null
        }
    }
}
