import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import BetModel from '@models/bet.model'

@Entity()
export default class LotteryModel {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ nullable: false })
    status!: boolean

    @Column({ nullable: false, name: 'date_begin' })
    dateBegin!: number

    @Column({ nullable: false, name: 'date_end' })
    dateEnd!: number

    @Column({ nullable: false, name: 'range_min' })
    rangeMin!: number

    @Column({ nullable: false, name: 'range_max' })
    rangeMax!: number

    @OneToMany(() => BetModel, (bet) => bet.lottery)
    bets!: BetModel[]
}
