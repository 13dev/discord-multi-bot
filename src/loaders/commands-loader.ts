import {readdirSync} from 'fs'
import {Command} from '@src/command'
import {Container} from 'typeorm-typedi-extensions'
import {Logger} from '@utils/logger'
import CommandResolver from '@src/resolver/command-resolver'

export default async function commandsLoader() {
    readdirSync('src/commands/').map(async (command: string) => {
        const className = await import('@commands/' + command.replace('.ts', ''))

        const commandInstance = Container.get<Command>(className.default)
        const commandKey = commandInstance.commandOptions.group + '_' + commandInstance.commandOptions.name

        Logger.info('Loading command: ' +  commandKey)

        CommandResolver.add(commandKey, className.default)

    })
}
