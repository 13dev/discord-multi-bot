export class DatabaseError extends Error {}

export class UserNotFoundError extends DatabaseError {
    constructor(props?: string) {
        super(props)
        this.name = 'UserNotFoundError'
        this.message = 'UserModel not found, please contact admin.'
    }
}
