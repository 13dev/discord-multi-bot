import {Token} from 'typedi'
import Lottery from '@models/lottery'

export const LOTTERY = new Token<Lottery>('LOTTERY')
