import {createConnection, ConnectionOptions, Connection} from 'typeorm'
import {database} from '@src/config'
import {Logger} from '@utils/logger'
import {Service} from 'typedi'

@Service()
export default class TypeOrmLoader {
    constructor() {
        createConnection(database as ConnectionOptions)
            .then(() => Logger.info('TypeORM Created Connection!'))
            .catch(console.log)
    }
}
