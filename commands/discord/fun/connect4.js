const Board = xrequire('./structures/classes/external/Board');
const DiscordCommand  = xrequire('./structures/classes/core/DiscordCommand');
const numberEmojiSuffix = '%E2%83%A3';

class Connect4 extends DiscordCommand {
    constructor (commandDefinition) {
        super(commandDefinition);
        this.boardWidth = 6;
        this.boardHeight = 7;
    }

    // eslint-disable-next-line no-unused-vars
    async validate (message) {
        return true; // if true execute() will run
    }

    async execute (message) {
        console.log("here");
        if (message.parsed.args.length < 1) return message.client.emit('invalidCommandCall', `Expected at least 1 argument.`, message);
        if (!message.mentions.users.first()) return message.client.emit('invalidCommandCall', `You'll need someone to play agaisnt.`, message);
        let players = [message.author, message.mentions.users.first()];
        let board = new Board(this.boardHeight, this.boardWidth);
        let emojiPlays = []; 
        for (let i = 0; i < this.boardWidth; i++) {
            emojiPlays.push(i + numberEmojiSuffix);
        }
        let turn = 1;
        let win = false;
        let exit = false;
        let gameMessage = null;
        let turnMessage = null;
        let filter = (reaction, user) => {
            return players[turn - 1].id === user.id && emojiPlays.includes(reaction.emoji.identifier);
        } 
        await message.channel.send('```' + board.toString() + '```').then(async boardMessage => gameMessage = boardMessage);
        await this.setControls(gameMessage, emojiPlays);
        await message.channel.send(`${players[turn-1].username}'s turn`).then(async m => turnMessage = m);
        while(!win || exit) {
            await gameMessage.awaitReactions(filter, { max: 1, time: 20000, errors: ['time'] })
                .then(collected => {
                    let reaction = collected.first();
                    let move = parseInt(reaction.emoji.identifier.slice(0, 1));
                    console.log(move);
                    try {
                        win = board.makeMoveAndCheckWin(turn, move).win;
                        gameMessage.edit('```' + board.toString() + '```');
                        console.log(reaction.remove(players[turn-1]));
                    } catch (e) {
                        console.log(e);
                        exit = true;
                    }
                })
                .catch(() => {
                    message.channel.send(`Took too long to make a move.`);
                    exit = true;
                    return;
                });
            if(!win) turn = (turn === 1 ? 2 : 1);
            turnMessage.edit(`${players[turn-1].username}'s turn`);
        }
        await message.channel.send('```' + board.toString() + '```')
        if (win) message.channel.send(`${players[turn - 1].username} WINS!`);
    }

    async setControls (message, emojis) {
        for (let emoji of emojis) {
            try {
                await message.react(emoji);
            }
            catch (error) {
                console.log(error);
                return;
            }
        }
    }
}
module.exports = Connect4;
