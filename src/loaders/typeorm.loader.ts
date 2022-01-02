import { createConnection, ConnectionOptions, Connection } from 'typeorm'
import { LoggerUtil } from '@utils/logger.util'
import { Config } from '@src/config'

export default async function typeormLoader() {
    return await createConnection(Config.database as ConnectionOptions).then(
        (_) => LoggerUtil.info('TypeORM Created Connection!')
    )
}
