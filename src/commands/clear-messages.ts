import {Message} from 'discord.js'
import {Command} from '@src/command'
import DiscordClient from '@src/discord-client'
import {Container, Service} from 'typedi'
import {LOTTERY_ID} from '@utils/consts'
import { channel } from 'diagnostics_channel'

import { Collection } from '@discordjs/collection';


@Service()
export default class extends Command {
    constructor(client: DiscordClient) {
        super(client, {
            name: 'clear',
            description: 'Clears the messages.',
            category: '',
            requiredPermissions: [],
        })
    }

    public async run(message: Message, value:string[]): Promise<void> {

        if (message.channel.type === 'text') {
            message.channel.bulkDelete(10)
        }
        //need to change the parameters so we can "-clear value"


    }
}
