import dotenv from 'dotenv'
dotenv.config()

export default {
    discord: {
        token: process.env.TOKEN || '',
        serverId: '',
        warnChannelId: process.env.CHANNEL || 'lottery',
        modRoleId: [''],
        statusMessage: '',
        commandPrefix: process.env.PREFIX || '-',
    }
}
