import {Command} from '@src/command'

export default class CommandResolver {
    static commandNames: { [index: string]: Command } = {}

    public static resolve(command: string): Command | undefined {
        return this.commandNames[command]
    }

    public static add(index: string, command: Command) {
        this.commandNames[index] = command
    }
}
