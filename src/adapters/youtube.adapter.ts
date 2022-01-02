import Youtube from 'youtube.ts'
import { Service } from 'typedi'
import { Config } from '@src/config'

@Service()
export default class YoutubeAdapter {
    constructor(private _youtube = new Youtube(Config.youtube.apiKey)) {}

    get youtube(): Youtube {
        return this._youtube
    }
}
