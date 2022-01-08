import { Inject, Service } from 'typedi'
import { Command, CommandOptions } from '@src/command'
import { Message, MessageEmbed } from 'discord.js'
import PlayerService from '@services/player.service'
import { STATUS } from '@src/player'
import { toTime } from '@utils/time.util'
import { Queue } from 'queue-typescript'
import { QueuedSong } from '@src/types'
const PAGE_SIZE = 10

@Service()
export default class extends Command {
    @Inject()
    private readonly playerService!: PlayerService

    @Inject('queue')
    private readonly queue!: Queue<QueuedSong>

    get options(): CommandOptions {
        return {
            name: 'queue',
            signature: {
                command: 'queue',
                arguments: ['page'],
            },
            description: 'Show current queue',
            category: 'Information',
            requiredPermissions: [],
        }
    }

    public async run(message: Message, args: string[]): Promise<void> {
        const player = this.playerService.get(message.guild!.id)

        const currentlyPlaying = this.queue.front

        if (currentlyPlaying) {
            const queueSize = this.queue.length
            const queuePage = args[0] ? parseInt(args[0], 10) : 1

            const maxQueuePage = Math.ceil((queueSize + 1) / PAGE_SIZE)

            if (queuePage > maxQueuePage) {
                await message.channel.send("the queue isn't that big")
                return
            }

            const embed = new MessageEmbed()

            embed.setTitle(currentlyPlaying.title)
            embed.setURL(
                `https://www.youtube.com/watch?v=${currentlyPlaying.url}`
            )

            let description = player.status === STATUS.PLAYING ? '⏹️' : '▶️'
            description += ' '
            description +=
                toTime(player.getPosition()) +
                ' - ' +
                toTime(currentlyPlaying.length)
            description += ' '
            description += ' 🔉'
            description += this.queue.length === 0 ? '' : '\n\n**Next up:**'

            embed.setDescription(description)

            let footer = `Source: ${currentlyPlaying.artist}`

            if (currentlyPlaying.playlist) {
                footer += ` (${currentlyPlaying.playlist.title})`
            }

            embed.setFooter(footer)

            const queuePageBegin = (queuePage - 1) * PAGE_SIZE
            const queuePageEnd = queuePageBegin + PAGE_SIZE

            this.queue
                .toArray()
                .splice(1)
                .slice(queuePageBegin, queuePageEnd)
                .forEach((song, i) => {
                    embed.addField(
                        `${i + 1 + queuePageBegin}/${queueSize - 1}`,
                        song.title,
                        false
                    )
                })

            embed.addField('Page', `${queuePage} out of ${maxQueuePage}`, false)

            await message.channel.send({ embeds: [embed] })
        } else {
            await message.channel.send('queue empty')
        }
    }
}
