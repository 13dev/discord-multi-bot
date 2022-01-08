import { Service } from 'typedi'
import SpotifyWebApi from 'spotify-web-api-node'
import { Config } from '@src/config'

@Service()
export default class SpotifyAdapter extends SpotifyWebApi {
    private spotifyTokenTimerId?: NodeJS.Timeout

    constructor() {
        super(Config.spotify)
        void this.refreshSpotifyToken()
    }

    cleanup() {
        if (this.spotifyTokenTimerId) {
            clearTimeout(this.spotifyTokenTimerId)
        }
    }

    private async refreshSpotifyToken() {
        const auth = await this.clientCredentialsGrant()
        this.setAccessToken(auth.body.access_token)

        this.spotifyTokenTimerId = setTimeout(
            this.refreshSpotifyToken.bind(this),
            (auth.body.expires_in / 2) * 1000
        )
    }
}
