import Youtube from 'youtube.ts'
import { Service } from 'typedi'
import { Config } from '@src/config'
import { videoFormat } from 'ytdl-core'

type VideoFormat = videoFormat
type VideoFormats = VideoFormat[]

@Service()
export default class YoutubeAdapter extends Youtube {
    constructor() {
        super(Config.youtube.apiKey)
    }

    public chooseNextBestFormat(formats: VideoFormats): VideoFormat {
        // TODO: CACHE
        // try {
        //     // ffmpegInput = await this.fileCache.getPathFor(
        //     //     this.getHashForCache(url)
        //     // )
        //
        //     if (options.seek) {
        //         ffmpegInputOptions.push('-ss', options.seek.toString())
        //     }
        // } catch {

        const bestFormat = formats.find(YoutubeAdapter.findByCodecAndSampleRate)

        if (!bestFormat) {
            const format = YoutubeAdapter.nextBestFormat(formats)

            if (!format) {
                throw new Error('Cant find suitable format.')
            }

            return format
        }

        return bestFormat
    }

    private static nextBestFormat(formats: VideoFormats): VideoFormat | undefined {
        if (formats[0].isLive) {
            return formats
                .sort(YoutubeAdapter.sortByAudioBitRate)
                .find(YoutubeAdapter.findByLiveStreamItags)
        }

        return (
            formats
                .sort(YoutubeAdapter.sortByAudioBitRate)
                .filter((format) => format.averageBitrate)
                .sort(YoutubeAdapter.sortByAverageBitRate)
                .find((format) => !format.bitrate) ?? formats[0]
        )
    }

    private static sortByAudioBitRate(a: VideoFormat, b: VideoFormat) {
        return b.audioBitrate! - a.audioBitrate!
    }

    private static sortByAverageBitRate(a: VideoFormat, b: VideoFormat) {
        return a && b ? b.averageBitrate! - a.averageBitrate! : 0
    }

    private static findByCodecAndSampleRate(format: VideoFormat) {
        return (
            format.codecs === 'opus' &&
            format.container === 'webm' &&
            format.audioSampleRate !== undefined &&
            parseInt(format.audioSampleRate, 10) === 48000
        )
    }

    private static findByLiveStreamItags(format: VideoFormat) {
        return [128, 127, 120, 96, 95, 94, 93].includes(Number(format.itag))
    }
}
