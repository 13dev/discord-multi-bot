import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import BetModel from '@models/bet.model'

@Entity()
export default class UserModel {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @Column({ name: 'discord_id' })
    discordId!: string

    @OneToMany(() => BetModel, (bet) => bet.user)
    bets!: BetModel[]
}
