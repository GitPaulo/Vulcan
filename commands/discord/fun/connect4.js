const Board = xrequire('./structures/classes/external/connect4/Board');
const MCTS = xrequire('./structures/classes/external/connect4/Mcts');
const DiscordCommand  = xrequire('./structures/classes/core/DiscordCommand');
const numberEmojiSuffix = '%E2%83%A3';

class Connect4 extends DiscordCommand {
    constructor (commandDefinition) {
        super(commandDefinition);
        this.boardWidth = 7;
        this.boardHeight = 6;
        this.emojiPlays = [];
        for (let i = 0; i < this.boardWidth; i++) {
            this.emojiPlays.push(i + numberEmojiSuffix);
        }
    }

    // eslint-disable-next-line no-unused-vars
    async validate (message) {
        return true; // if true execute() will run
    }

    async execute (message) {
        if (message.parsed.args.length < 1) return message.client.emit('invalidCommandCall', `Expected at least 1 argument.`, message);
        let players = [message.author];
        if (!message.mentions.users.first()) {
            players.push(message.client.user);
        } else {
            players.push(message.mentions.users.first());
        }

        let board = new Board(this.boardHeight, this.boardWidth);
        let turn = 1;
        let win = false;
        let draw = false;
        let exit = false;
        let gameMessage = null;
        let turnMessage = null;

        await message.channel.send('```' + board.toString() + '```').then(async function (boardMessage) { gameMessage = boardMessage });
        await this.setControls(gameMessage, this.emojiPlays);
        await message.channel.send(`<@${players[turn - 1].id}>'s turn`).then(async function (m) { turnMessage = m });
        while (!win && !draw && !exit) {
            let move = await this.getMove(turn, board, players, gameMessage);
            try {
                let state = board.makeMoveAndCheckWin(turn, move);
                win = state.win;
                draw = state.draw;
                gameMessage.edit('```' + board.toString() + '```');
            } catch (e) {
                console.log(e);
                exit = true;
            }
            if (!win && !draw) turn = (turn === 1 ? 2 : 1);
            turnMessage.edit(`<@${players[turn - 1].id}>'s turn`);
        }
        await gameMessage.edit('```' + board.toString() + '```');
        if (win) turnMessage.edit(`<@${players[turn - 1].id}> WINS!`);
        if (draw) turnMessage.edit(`IT'S A DRAW!`);
    }

    async setControls (message, emojis) {
        for (let emoji of emojis) {
            try {
                await message.react(emoji);
            } catch (error) {
                console.log(error);
                return;
            }
        }
    }

    async getMove (turn, board, players, gameMessage) {
        let move = -1;
        if (players[turn - 1].bot) {
            move = MCTS(board, turn);
        } else {
            let filter = (reaction, user) => {
                return players[turn - 1].id === user.id && this.emojiPlays.includes(reaction.emoji.identifier);
            };
            await gameMessage.awaitReactions(filter, { max: 1 })
                    .then(collected => {
                        let reaction = collected.first();
                        move = parseInt(reaction.emoji.identifier.slice(0, 1), 10);
                        reaction.remove(players[turn - 1]);
            });
        }
        return move;
    }
}
module.exports = Connect4;
