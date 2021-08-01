const db = require('../database')
const moment = require('moment')

module.exports = class Bet {
    constructor() {
        // this.user = null
        // this.lottery = null
        // this.createdAt = null
    }

    getAllByLotteryId(id) {
        return db.prepare('SELECT * FROM bets WHERE lottery_id = ?').get(id)
    }

    create(userId, lotteryId) {
        return db
            .prepare('INSERT INTO bets (user_id, lottery_id, created_at) VALUES (?, ?, ?)')
            .run(userId, lotteryId, moment().unix())
    }

    getById(id) {
        return db
            .prepare('SELECT * FROM bets WHERE id = ?')
            .get(id)
    }
}
