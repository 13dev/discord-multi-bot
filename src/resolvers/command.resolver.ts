import { Command } from '@src/command'

export default class CommandResolver {
    static commandNames: Map<string[], Command> = new Map<string[], Command>()

    public static resolve(command: string): Command | undefined {
        for (const [alias, commandInstance] of this.commandNames) {
            if (alias.includes(command)) {
                return commandInstance
            }
        }
        return
    }

    public static add(index: string[], command: Command) {
        this.commandNames.set(index, command)
    }
}
