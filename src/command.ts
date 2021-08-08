import {
    User,
    Message,
    Guild,
    PermissionString,
    NewsChannel,
    DMChannel,
    TextChannel,
    MessageEmbed,
} from 'discord.js'
import DiscordClient from '@src/discord-client'

export interface CommandOptions {
    name: string;
    description?: string;
    usage?: string;
    category?: string;
    cooldown: number;
    requiredPermissions: PermissionString[];
}

export interface UserCooldown {
    user: User
    guild: Guild
}

export type AnyChannel = TextChannel | DMChannel | NewsChannel
export type EmbedOrMessage = MessageEmbed | string

export abstract class Command {
    public commandOptions: CommandOptions
    public cooldowns: Set<UserCooldown>

    constructor(protected client: DiscordClient, options: CommandOptions) {
        this.commandOptions = {
            name: options.name,
            description: options.description || 'No information specified.',
            usage: options.usage || 'No usage specified.',
            category: options.category || 'Information',
            cooldown: options.cooldown || 1000,
            requiredPermissions: options.requiredPermissions || ['READ_MESSAGES'],
        }
        this.cooldowns = new Set()
    }

    public canRun(user: User, message: Message): boolean {
        const onCooldown =
            [...this.cooldowns].filter(cd => cd.user === user && cd.guild === message.guild)
                .length > 0
        const hasPermission = message.member
            ? message.member.hasPermission(this.commandOptions.requiredPermissions, {
                checkAdmin: true,
                checkOwner: true,
            })
            : false

        if (!hasPermission || onCooldown) {
            message.channel.send('You do not have permission for this command or you are on cooldown.')
            return false
        }

        return true
    }

    public setCooldown(user: User, guild: Guild): void {
        this.cooldowns.add({user, guild})

        setTimeout(() => {
            const cooldown = [...this.cooldowns].filter(
                cd => cd.user === user && cd.guild === guild,
            )[0]
            this.cooldowns.delete(cooldown)
        }, this.commandOptions.cooldown)
    }

    public async respond(channel: AnyChannel, message: EmbedOrMessage): Promise<Command> {
        await channel.send(message)

        return this
    }

    public abstract run(message: Message, args: string[]): Promise<void>;
}
