import message from '@events/message.event'
import ready from '@events/ready.event'

export enum EventType {
    READY = 'ready',
    MESSAGE = 'message',
}

export interface BotEvent {
    type: EventType

    run(args?: any[]): void
}

export default [message, ready]
