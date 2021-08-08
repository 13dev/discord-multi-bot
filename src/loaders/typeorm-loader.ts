import {createConnection, ConnectionOptions} from 'typeorm'
import {database} from '@src/config'
import {Logger} from '@utils/logger'
import User from '@models/user'


class TypeOrmLoader {
    public static async load() {
        const options = database as ConnectionOptions

        console.log(options.entities)
        await createConnection(options).then(connection => {
            let photo = new User()
            photo.name = 'Me and Bears'

            return connection.manager
                .save(photo)
                .then(photo => {
                    console.log('Photo has been saved. Photo id is', photo.id)
                })
        })


        Logger.info('TypeORM Created Connection!')
    }
}

export default TypeOrmLoader
