import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index} from 'typeorm'
import Lottery from '@models/lottery'
import User from '@models/user'


@Entity()
@Index(['lottery', 'user'], { unique: true })
export default class Bet {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({nullable: false, name: 'created_at'})
    createdAt!: number

    @Column({nullable: false})
    number!: number

    @ManyToOne(() => Lottery, lottery => lottery.bets)
    @JoinColumn({name: 'lottery_id'})
    lottery!: Lottery

    @ManyToOne(() => User, lottery => lottery.bets)
    @JoinColumn({name: 'user_id'})
    user!: User
}
