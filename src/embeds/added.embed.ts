import { Message, MessageEmbed } from 'discord.js'
import { QueuedSong } from '@src/types'
import { toTime } from '@utils/time.util'
import { Queue } from 'queue-typescript'

type Options = {
    message: Message
    music: QueuedSong
    queue: Queue<QueuedSong>
}

export function addedToQueueEmbed(options: Options) {
    let timeOfQueue = 0
    let embed = new MessageEmbed()
        .setAuthor({
            name: 'Added to queue',
            iconURL: options.message.author.displayAvatarURL({ dynamic: true }),
        })
        .setURL(`https://www.youtube.com/watch?v=${options.music.url}`)
        .setTitle('**' + options.music.title + '**')
        .setColor('#ffffff')
        .setThumbnail(
            `https://img.youtube.com/vi/${options.music.url}/mqdefault.jpg`
        )
        .addField('Channel: ', options.music.artist, true)
        .addField(
            'Duration: ',
            options.music.isLive ? 'LIVE STREAM' : toTime(options.music.length),
            true
        )

    //timing for estimated time creation
    if (options.queue.length > 0) {
        options.queue.toArray().map((e) => (timeOfQueue += e.length))
    }

    //timeOfQueue += options.queue.front.length - player.position
    timeOfQueue -= options.music.length

    embed.addField('Estimated time until playing: ', toTime(timeOfQueue), true)

    embed.addField('Position in queue: ', `${options.queue.length}`, true)
    return embed
}
