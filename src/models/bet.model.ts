import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm'
import LotteryModel from '@models/lottery.model'
import UserModel from '@models/user.model'

@Entity()
@Index(['lottery', 'user'], { unique: true })
export default class BetModel {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ nullable: false, name: 'created_at' })
    createdAt!: number

    @Column({ nullable: false })
    number!: number

    @ManyToOne(() => LotteryModel, (lottery) => lottery.bets)
    @JoinColumn({ name: 'lottery_id' })
    lottery!: LotteryModel

    @ManyToOne(() => UserModel, (lottery) => lottery.bets)
    @JoinColumn({ name: 'user_id' })
    user!: UserModel
}
