import ListVotesCommand from '@commands/list-votes-command'
import PingCommand from '@commands/ping-command'
import {Command} from '@src/command'

export default class CommandResolver {
    static commandNames: { [index: string]: typeof Command } = {
        'list-votes': ListVotesCommand,
        'ping': PingCommand,
    }

    public static resolve(command: string): typeof Command | undefined {
        return this.commandNames[command]
    }
}
