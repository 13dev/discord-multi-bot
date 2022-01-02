import { Service } from 'typedi'
import SpotifyWebApi from 'spotify-web-api-node'
import { Config } from '@src/config'

@Service()
export default class SpotifyAdapter {
    readonly spotify: SpotifyWebApi
    private spotifyTokenTimerId?: NodeJS.Timeout

    constructor() {
        this.spotify = new SpotifyWebApi(Config.spotify)
        void this.refreshSpotifyToken()
    }

    cleanup() {
        if (this.spotifyTokenTimerId) {
            clearTimeout(this.spotifyTokenTimerId)
        }
    }

    private async refreshSpotifyToken() {
        const auth = await this.spotify.clientCredentialsGrant()
        this.spotify.setAccessToken(auth.body.access_token)

        this.spotifyTokenTimerId = setTimeout(
            this.refreshSpotifyToken.bind(this),
            (auth.body.expires_in / 2) * 1000
        )
    }
}
