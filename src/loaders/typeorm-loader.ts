import {createConnection, ConnectionOptions, Connection} from 'typeorm'
import {database} from '@src/config'
import {Logger} from '@utils/logger'

export default async function typeOrmLoader() {
    return await createConnection(database as ConnectionOptions)
        .then(_ => Logger.info('TypeORM Created Connection!'))
}
