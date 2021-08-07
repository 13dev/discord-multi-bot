import Lottery from '@models/lottery'
import database from '@src/database'
import moment from 'moment'

export interface LotteryRepositoryInterface {
    create(lotttery: Lottery): number
}

export default class LotteryRepository implements LotteryRepositoryInterface {
    create(lottery: Lottery): number {
        const result = database
            .prepare('INSERT INTO lotteries (date_start, date_end, status, range_min, range_max) VALUES (?, ?, ?, ?, ?)')
            .run(moment().unix(), lottery.dates.end, lottery.status, lottery.range.min, lottery.range.max)

        return result.lastInsertRowid as number
    }
}
