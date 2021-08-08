import {Message} from 'discord.js'
import {Command} from '@src/command'
import DiscordClient from '@src/discord-client'
import {Container, Service, Token} from 'typedi'
import {getCustomRepository} from 'typeorm'
import {LotteryRepository} from '@repositories/lottery-repository'
import Lottery from '@models/lottery'
import {Logger} from '@utils/logger'

@Service()
export default class PingCommand extends Command {
    constructor(client: DiscordClient) {
        super(client, {
            description: 'Pings the bot.',
            category: 'Information',
            requiredPermissions: [],
        })
    }

    public async run(message: Message): Promise<void> {
        await super.respond(message.channel, 'Pong!' + Container.get('lottery-id'))
    }
}
