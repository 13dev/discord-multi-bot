import {createConnection, ConnectionOptions} from 'typeorm'
import {database} from '@src/config'
import {Logger} from '@utils/logger'

class TypeOrmLoader {
    public static async load() {
        const options = database as ConnectionOptions

        await createConnection(options)
        Logger.info('TypeORM Created Connection!')
    }
}

export default TypeOrmLoader
