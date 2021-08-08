import {BotEvent, EventType} from '@events/index'


export default class OnReadyEvent implements BotEvent {
    type: EventType = EventType.READY

    run(args?: any[]): void {

    }
}
