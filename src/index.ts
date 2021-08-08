import 'module-alias/register'
import 'reflect-metadata'

import {Container} from 'typeorm-typedi-extensions'
import {Container as c} from 'typedi'
import DiscordLoader from '@loaders/discord-loader'
import TypeOrmLoader from '@loaders/typeorm-loader'
import {useContainer} from 'typeorm'
import LotteryLoader from '@loaders/lottery-loader'
import {Logger} from '@utils/logger'

useContainer(Container)

Container.get(TypeOrmLoader).load()
    .then(connection => {
        Logger.info('TypeORM Created Connection!')
        Container.get(DiscordLoader)
        Container.get(LotteryLoader)
    })
    .catch(console.log)





