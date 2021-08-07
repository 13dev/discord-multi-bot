import database from '@src/database'
import Bet from '@models/bet'

export interface BetRepositoryInterface {
    create(bet: Bet): number

    getAllByLotteryId(lotteryId: number): Array<Bet>

    getById(id: number): Bet

    isBetTaken(betNumber: number): boolean

    getByUserId(userId: number): Bet

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
            .run(bet.userId, bet.lotteryId, bet.createdAt)

        return result.lastInsertRowid as number
    }

    getById(id: number): Bet {
        return database
            .prepare('SELECT * FROM bets WHERE id = ?')
            .get(id)
    }

    isBetTaken(betNumber: number): boolean {
        const result = database
            .prepare('SELECT * FROM bets WHERE number = ?')
            .all(betNumber)

        return result.length > 0
    }

    getByUserId(userId: number): Bet {
        return database
            .prepare('SELECT * FROM bets WHERE user_id = ?')
            .get(userId)
    }

}
