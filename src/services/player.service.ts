import { Container, Service } from 'typedi'
import { Player } from '@src/player'

@Service()
export default class {
    private readonly guildPlayers: Map<string, Player> = new Map()

    get(guildId: string): Player {
        let player = this.guildPlayers.get(guildId)

        if (!player) {
            player = Container.get(Player)

            this.guildPlayers.set(guildId, player)
        }

        return player
    }
}
