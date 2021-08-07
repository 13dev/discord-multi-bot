import database from '@src/database'
const moment = require('moment')
export default class Bet {
    constructor(private _id: number,
                private _userId: number,
                private _lotteryId: number,
                private _createdAt: number) {
    }

    get id(): number {
        return this._id
    }

    set id(value: number) {
        this._id = value
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

}
