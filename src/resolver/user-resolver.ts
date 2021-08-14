import {getCustomRepository} from 'typeorm'
import {UserRepository} from '@repositories/user-repository'
import {User as DiscordUser} from 'discord.js'
import User from '@models/user'

export default class UserResolver {
    public static async resolve(discordUser: DiscordUser): Promise<User> {
        const userRepository = getCustomRepository(UserRepository)
        let user = await userRepository.findOne({discordId: discordUser.id, name: discordUser.username})

        if (!user) {
            user = await userRepository.save({
                name: discordUser.username,
                discordId: discordUser.id,
            })
        }

        return user
    }
}
