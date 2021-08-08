import Lottery from '@src/models/lottery'
import database from '@src/database'
import moment from 'moment'

export interface LotteryRepositoryInterface {
    create(lotttery: Lottery): number
    getCurrentLottery(): Lottery | undefined
}

export default class LotteryRepository implements LotteryRepositoryInterface {
    create(lottery: Lottery): number {
        const result = database
            .prepare('INSERT INTO lotteries (date_start, date_end, status, range_min, range_max) VALUES (?, ?, ?, ?, ?)')
            .run(moment().unix(), lottery.dates.end, lottery.status, lottery.range.min, lottery.range.max)

        return result.lastInsertRowid as number
    }

    getCurrentLottery(): Lottery | undefined {
        const result: Array<Lottery> = database
            .prepare('SELECT * FROM lotteries WHERE ? BETWEEN date_start AND date_end AND status = 1')
            .all()

        const lottery: Lottery | undefined = result.find((lottery: Lottery) => {
            const currentTime = moment().unix()
            return currentTime > lottery.dates.start && currentTime < lottery.dates.end
        })

        return lottery !== undefined && lottery.status ? lottery : undefined
    }
}
