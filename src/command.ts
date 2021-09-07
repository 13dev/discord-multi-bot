import {
    User,
    Message,
    PermissionString,
    NewsChannel,
    DMChannel,
    TextChannel,
    MessageEmbed,
} from 'discord.js'
import DiscordClient from '@src/discord-client'
import {Inject} from 'typedi'


export enum CommandGroups {
    LOTTERY = 'lottery',
    MUSIC = 'music',
    GLOBAL = '',
}

export interface CommandOptions {
    name: string
    description?: string
    category?: string
    requiredPermissions: PermissionString[]
}

export type AnyChannel = TextChannel | DMChannel | NewsChannel
export type EmbedOrMessage = MessageEmbed | string

export abstract class Command {
    public commandOptions: CommandOptions
    public group: CommandGroups = CommandGroups.GLOBAL

    protected constructor(@Inject() protected client: DiscordClient, options: CommandOptions) {
        this.commandOptions = {
            name: options.name,
            description: options.description || 'No information specified.',
            category: options.category || 'Information',
            requiredPermissions: options.requiredPermissions || ['READ_MESSAGES'],
        }
    }

    public async canRun(user: User, message: Message): Promise<boolean> {
        if (!message.member) {
            return false
        }

        const hasPermission = message.member.hasPermission(this.commandOptions.requiredPermissions, {
            checkAdmin: true,
            checkOwner: true,
        })

        if (!hasPermission) {
            await message.channel.send('You do not have permission for this command.')
            return false
        }

        return true
    }

    public async respond(channel: AnyChannel, message: EmbedOrMessage): Promise<Command> {
        await channel.send(message)
        return this
    }

    public abstract run(message: Message, args: string[]): Promise<void>
}
