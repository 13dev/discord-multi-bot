import 'module-alias/register'
import 'reflect-metadata'
import { Container } from 'typeorm-typedi-extensions'
import { Container as Container2 } from 'typedi'
import { useContainer } from 'typeorm'
import typeormLoader from '@loaders/typeorm.loader'
import lotteryLoader from '@loaders/lottery.loader'
import commandLoader from '@loaders/command.loader'
import { USER } from '@utils/consts.util'
import discordLoader from '@loaders/discord.loader'
import { Queue } from 'queue-typescript'
import { QueuedSong } from '@src/types'

async function bootstrap() {
    //TODO: Remove this.
    Container2.set(USER, 0)
    Container2.set('queue', new Queue<QueuedSong>())

    await useContainer(Container)
    await typeormLoader()
    await discordLoader()
    await lotteryLoader()
    await commandLoader()

    console.log('Bot is now running')
}

bootstrap()
