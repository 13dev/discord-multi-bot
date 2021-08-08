import 'module-alias/register'
import 'reflect-metadata'

import {useContainer} from 'typeorm'
import {Container} from 'typeorm-typedi-extensions'
import DiscordLoader from '@loaders/discord-loader'
import TypeOrmLoader from '@loaders/typeorm-loader'

useContainer(Container)

Container.get(TypeOrmLoader)
Container.get(DiscordLoader)
