import ListVotesCommand from '@commands/list-votes-command'
import PingCommand from '@commands/ping-command'
import {Command} from '@src/command'
import VoteCommand from '@commands/vote-command'
import OpenLotteryCommand from '@commands/open-lottery-command'

export default class CommandResolver {
    static commandNames: { [index: string]: typeof Command } = {
        'list-votes': ListVotesCommand,
        'ping': PingCommand,
        'vote': VoteCommand,
        'open-lottery': OpenLotteryCommand,
    }

    public static resolve(command: string): typeof Command | undefined {
        return this.commandNames[command]
    }
}
