import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm'
import Bet from '@models/bet'

@Entity()
export default class User {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @Column({name: 'discord_id'})
    discordId!: string

    @OneToMany(() => Bet, bet => bet.user)
    bets!: Bet[]
}
