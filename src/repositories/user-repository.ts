import User from '@src/models/user'
import database from '@src/database'
import moment from 'moment'

export interface UserRepositoryInterface {
    create(user: User): number

    getById(id: number): User

    all(): Array<User>
}

export default class UserRepository implements UserRepositoryInterface {
    all(): User[] {
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

    getById(id: number): User {
        return database
            .prepare('SELECT * FROM users WHERE id = ?')
            .get(id)
    }

}
