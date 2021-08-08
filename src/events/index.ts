import message from '@events/on-message-event'
import ready from '@events/on-ready-event'

export enum EventType {
    READY = 'ready',
    MESSAGE = 'message',
}

export interface BotEvent {
    type: EventType

    run(args?: any[]): void
}

export default [
    message,
    ready,
]
