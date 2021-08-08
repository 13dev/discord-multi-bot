import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm'
import Bet from '@models/bet'

@Entity()
export default class Lottery {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({nullable: false})
    status!: boolean

    @Column({nullable: false, name: 'date_begin'})
    dateBegin!: number

    @Column({nullable: false, name: 'date_end'})
    dateEnd!: number

    @Column({nullable: false, name: 'range_min'})
    rangeMin!: number

    @Column({nullable: false, name: 'range_max'})
    rangeMax!: number

    @OneToMany(() => Bet, bet => bet.lottery)
    bets!: Bet[];
}
