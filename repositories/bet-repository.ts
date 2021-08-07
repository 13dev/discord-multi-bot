import Lottery from '@models/lottery'
import database from '@src/database'
import moment from 'moment'
import Bet from '@models/bet'

interface BetRepositoryInterface {
    create(bet: Bet): number

    getAllByLotteryId(lotteryId: number): Array<Bet>

    getById(id: number): Bet
}

export default class BetRepository implements BetRepositoryInterface {
    getAllByLotteryId(lotteryId: number): Array<Bet> {
        return database
            .prepare('SELECT * FROM bets WHERE lottery_id = ?')
            .get(lotteryId)
    }

    create(bet: Bet): number {
        const result = database
            .prepare('INSERT INTO bets (user_id, lottery_id, created_at) VALUES (?, ?, ?)')
            .run(bet.userId, bet.lotteryId, moment().unix())

        return result.lastInsertRowid as number
    }

    getById(id: number): Bet {
        return database
            .prepare('SELECT * FROM bets WHERE id = ?')
            .get(id)
    }

}
