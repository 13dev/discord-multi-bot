import { Token } from 'typedi'
import UserModel from '@models/user.model'

export const LOTTERY_ID = new Token<number>('LOTTERY_ID')
export const USER = new Token<UserModel>('USER')
