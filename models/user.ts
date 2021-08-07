export default class User {
    private _id: number
    private _name: String

    constructor(id: number, name: String) {
        this._id = id
        this._name = name
    }

    get id(): number {
        return this._id
    }

    set id(value: number) {
        this._id = value
    }

    get name(): String {
        return this._name
    }

    set name(value: String) {
        this._name = value
    }
}
