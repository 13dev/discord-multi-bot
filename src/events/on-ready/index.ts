
import DiscordClient from '../../client/Discord';
import colorConsole from '../../utils/colorConsole';

const handler = async () => {
    const client = DiscordClient.getInstance();
    if (client) {
        await client.user.setPresence({ status: 'online', activity: { name: client.config.statusMessage, type: 'PLAYING' } });
        colorConsole.green('[DISCORD] Setted Presence');
        colorConsole.gray(`[DISCORD] Discord Bot is ready!: https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=0`);
    } else {
        colorConsole.yellow('[DISCORD] Could not get instance of discord client!');
    }
};

export default handler;
