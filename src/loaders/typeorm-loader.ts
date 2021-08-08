import {createConnection, ConnectionOptions, Connection} from 'typeorm'
import {database} from '@src/config'
import {Service} from 'typedi'

@Service()
export default class TypeOrmLoader {
    public async load() {
        return await createConnection(database as ConnectionOptions)
    }
}
