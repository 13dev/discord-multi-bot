import { Guild, GuildMember, VoiceChannel } from 'discord.js'

export const getSizeWithoutBots = (channel: VoiceChannel): number =>
    channel.members.filter((m) => !m.user.bot).size

export const getMemberVoiceChannel = (
    member?: GuildMember
): [VoiceChannel, number] | null => {
    const channel = member?.voice?.channel
    if (channel && channel.type === 'GUILD_VOICE') {
        return [channel, getSizeWithoutBots(channel)]
    }

    return null
}

export const getMostPopularVoiceChannel = (
    guild: Guild
): [VoiceChannel, number] => {
    interface PopularResult {
        n: number
        channel: VoiceChannel | null
    }

    const voiceChannels: PopularResult[] = []

    for (const [_, channel] of guild.channels.cache) {
        if (channel.type === 'GUILD_VOICE') {
            const size = getSizeWithoutBots(channel as VoiceChannel)

            voiceChannels.push({
                channel: channel as VoiceChannel,
                n: size,
            })
        }
    }

    // Find most popular channel
    const popularChannel = voiceChannels.reduce(
        (popular, elem) => (elem.n > popular.n ? elem : popular),
        { n: -1, channel: null }
    )

    if (popularChannel.channel) {
        return [popularChannel.channel, popularChannel.n]
    }

    throw new Error()
}
