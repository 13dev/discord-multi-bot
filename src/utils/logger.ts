import {createLogger, transports as Transports, format} from 'winston'

const {printf, combine, timestamp, colorize} = format
const colorizer = colorize()

export const Logger = createLogger({
    transports: new Transports.Console(),
    level: 'debug',
    format: combine(
        timestamp({format: 'DD/MM/YYYY HH:mm:ss'}),
        printf(info => {
                const metadata = {
                    ...info,
                    level: undefined,
                    message: undefined,
                    timestamp: undefined,
                }

                return colorizer.colorize(info.level, `[${info.timestamp}]: ${info.message} ${
                    JSON.stringify(metadata) !== '{}' ? '- ' + JSON.stringify(metadata) : ''
                }`)
            },
        ),
    ),
})
