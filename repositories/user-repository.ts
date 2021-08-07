import User from '@models/user'
import database from '@src/database'
import moment from 'moment'

export interface UserRepositoryInterface {
    create(user: User): number

    all(): Array<User>
}

export default class UserRepository implements UserRepositoryInterface {
    all(): Array<User> {
        return database
            .prepare('SELECT * FROM users')
            .all()
    }

    create(user: User): number {
        const result = database
            .prepare('INSERT INTO users (name, id) VALUES (?, ?)')
            .run(user.name, user.id)

        return result.lastInsertRowid as number
    }

}
