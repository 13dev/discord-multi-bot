require('dotenv').config();

const {TOKEN, CHANNEL, PREFIX} = process.env;
const Discord = require('discord.js');
const client = new Discord.Client();
const Lottery = require('./lottery.js');
const lottery = new Lottery();

let usersLotteryList = [];
let lotteryBool = false;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {

    if (message.author.bot) return;

    if (message.content.indexOf(PREFIX) !== 0) return;

    const args = message.content.slice(PREFIX.length)
        .trim()
        .split(/ +/g);

    const command = args
        .shift()
        .toLowerCase();

    //command is PREFIX+lottery? ex: -lottery
    // if(command !== 'lottery') {
    //     return
    // }

    //is in the correct channel?
    if(message.channel.name !== CHANNEL) {
        return
    }

    if(command === 'dump') {

        lottery.addClient(43534)
        lottery.addVote(43534, 31)
        lottery.addClient(43531)
        lottery.addVote(43531, 13)
        lottery.isNumberVoted(13)

        message.reply('```js ' + JSON.stringify(lottery.users) + ' ```')
    }

});

client.login(TOKEN);
