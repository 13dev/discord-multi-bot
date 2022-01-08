import Youtube from 'youtube.ts'
import { Service } from 'typedi'
import { Config } from '@src/config'

@Service()
export default class YoutubeAdapter extends Youtube {
    constructor() {
        super(Config.youtube.apiKey)
    }
}
