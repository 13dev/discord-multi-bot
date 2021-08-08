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

export interface CommandOptions {
    description?: string
    category?: string
    requiredPermissions: PermissionString[]
}

export type AnyChannel = TextChannel | DMChannel | NewsChannel
export type EmbedOrMessage = MessageEmbed | string

export abstract class Command {
    public commandOptions: CommandOptions

    protected constructor(@Inject() protected client: DiscordClient, options: CommandOptions) {
        this.commandOptions = {
            description: options.description || 'No information specified.',
            category: options.category || 'Information',
            requiredPermissions: options.requiredPermissions || ['READ_MESSAGES'],
        }
    }

    public canRun(user: User, message: Message): boolean {
        if (!message.member) {
            return false
        }

        const hasPermission = message.member.hasPermission(this.commandOptions.requiredPermissions, {
            checkAdmin: true,
            checkOwner: true,
        })

        if (!hasPermission) {
            message.channel.send('You do not have permission for this command.')
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
