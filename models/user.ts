export default class User {
    private _id: Number
    private _name: String

    constructor(id: Number, name: String) {
        this._id = id
        this._name = name
    }

    get id(): Number {
        return this._id
    }

    set id(value: Number) {
        this._id = value
    }

    get name(): String {
        return this._name
    }

    set name(value: String) {
        this._name = value
    }
}
