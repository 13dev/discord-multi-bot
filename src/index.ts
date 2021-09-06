import 'module-alias/register'
import 'reflect-metadata'
import {Container} from 'typeorm-typedi-extensions'
import {Container as Container2} from 'typedi'
import {useContainer} from 'typeorm'
import typeOrmLoader from '@loaders/typeorm-loader'
import lotteryLoader from '@loaders/lottery-loader'
import commandsLoader from '@loaders/commands-loader'
import {USER} from '@utils/consts'
import discordLoader from '@loaders/discord-loader'

(async() => {
    //TODO: Remove this.
    Container2.set(USER, 0)

    await useContainer(Container)
    await typeOrmLoader()
    await discordLoader()
    await lotteryLoader()
    await commandsLoader()
})()










