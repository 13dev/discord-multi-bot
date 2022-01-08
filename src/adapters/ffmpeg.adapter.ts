import ffmpeg from 'fluent-ffmpeg'
import { path } from '@ffmpeg-installer/ffmpeg'
import { Service } from 'typedi'
import { Config } from '@src/config'
import { WriteStream } from 'fs-capacitor'
import { LoggerUtil } from '@utils/logger.util'
import { Readable } from 'stream'

@Service()
export class FfmpegAdapter {
    private options: string[]

    constructor() {
        ffmpeg.setFfmpegPath(path)
        this.options = Config.ffmpeg.initOptions
    }

    public pushOptions(...options: string[]) {
        this.options.push(...options)
    }

    public async createYoutubeStream(input: string): Promise<Readable> {
        return new Promise((resolve, reject) => {
            const capacitor = new WriteStream()

            // TODO: Cache video if necessary
            // if (shouldCacheVideo) {
            //     const cacheStream = this.fileCache.createWriteStream(
            //         this.getHashForCache(url)
            //     )
            //
            //     capacitor.createReadStream().pipe(cacheStream)
            // } else {
            //this.pushOptions('-re')
            //}

            const youtubeStream = ffmpeg(input)
                .inputOptions(...this.options)
                .noVideo()
                .audioCodec('libopus')
                .outputFormat('webm')
                .on('error', (error) => {
                    LoggerUtil.error(error)
                    reject(error)
                })

            youtubeStream.pipe(capacitor)

            resolve(capacitor.createReadStream())
        })
    }
}
