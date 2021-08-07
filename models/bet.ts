import database from '@src/database'
const moment = require('moment')
export default class Bet {
    private _id?: number
    constructor(private _userId: number,
                private _lotteryId: number,
                private _createdAt: number,
                private _number: number) {
    }

    get id(): number | undefined {
        return this._id
    }

    get userId(): number {
        return this._userId
    }

    set userId(value: number) {
        this._userId = value
    }

    get lotteryId(): number {
        return this._lotteryId
    }

    set lotteryId(value: number) {
        this._lotteryId = value
    }

    get createdAt(): number {
        return this._createdAt
    }

    set createdAt(value: number) {
        this._createdAt = value
    }

    get number(): number {
        return this._number
    }

    set number(value: number) {
        this._number = value
    }
}
