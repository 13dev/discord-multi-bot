import {Token} from 'typedi'
import Lottery from '@models/lottery'
import User from '@models/user'

export const LOTTERY = new Token<Lottery>('LOTTERY')
export const USER = new Token<User>('USER')
