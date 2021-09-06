import {Command} from '@src/command'
const {readdirSync} = require('fs')
import {settings} from '@src/config'
import {Container} from 'typedi'


export default class CommandResolver {
    static commandNames: { [index: string]: typeof Command }

    public static resolve(command: string): typeof Command | undefined {
        this.loadCommands()
        return this.commandNames[command]
    }


    public static loadCommands() {
        readdirSync('src/commands/')
            .map(async (command: string) => {

                const className = await import('@commands/' + command.replace('.ts', ''))

                const commandInstance: Command = Container.get(className.default)
                const accessCommand = settings.prefix + commandInstance.commandOptions.group + ' ' + commandInstance.commandOptions.name
                console.log(accessCommand)
                console.log(className.default)
                this.commandNames[accessCommand] = className.default

            })

    }
}
