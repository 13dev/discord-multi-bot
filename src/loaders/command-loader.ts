import {Command} from '@src/command'
import {Container} from 'typeorm-typedi-extensions'
import {Logger} from '@utils/logger'
import CommandResolver from '@src/resolver/command-resolver'
const getFiles = require('node-recursive-directory')

/**
 * Loads all classes in 'commands' directory, works with only one level deep.
 */
export default async function commandLoader() {
    (await getFiles('src/commands', true)).map(async (file: any) => {

        // Ignore the root directory
        const dir = file.dirname === 'commands' ? '' : file.dirname + '/'

        const className = await import('@commands/' + dir + file.filename.replace('.ts', ''))

        const commandInstance = Container.get<Command>(className.default)
        const commandKey = commandInstance.commandOptions.group + '_' + commandInstance.commandOptions.name

        Logger.info('Loading command: ' + commandKey)

        CommandResolver.add(commandKey, className.default)
    })

}
