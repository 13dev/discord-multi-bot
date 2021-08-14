import {Token} from 'typedi'
import User from '@models/user'

export const LOTTERY_ID = new Token<number>('LOTTERY_ID')
export const USER = new Token<User>('USER')
