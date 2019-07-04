const mcts           = xrequire('./structures/packages/connect4/Mcts');
const Board          = xrequire('./structures/packages/connect4/Board');
const logger         = xrequire('./managers/LogManager').getInstance();
const DiscordCommand = xrequire('./structures/classes/core/DiscordCommand');

const numberEmojiSuffix = '%E2%83%A3';

class Connect4 extends DiscordCommand {
    constructor (commandDefinition) {
        super(commandDefinition);

        // Default board size
        this.boardWidth  = 7;
        this.boardHeight = 6;

        // Command state & emojis
        this.games       = [];
        this.emojiPlays  = [];

        for (let i = 0; i < this.boardWidth; i++) {
            this.emojiPlays.push(i + numberEmojiSuffix);
        }
    }

    // eslint-disable-next-line no-unused-vars
    async validate (message) {
        return true; // if true execute() will run
    }

    async execute (message) {
        if (message.parsed.args.length < 1) {
            return message.client.emit('invalidCommandCall', `Expected at least 1 argument.`, message);
        }

        // Sort out challenge request
        const challenger = message.author;
        const challengee = message.mentions.users.first() || message.client.user;

        // let them know we mean business
        const challengeMessage = await message.channel.send(
            `<@${challenger.id}> has challenged <@${challengee.id}> for a connect 4 game!\nChallengee may accept by saying **'I accept'**.`
        );

        if (challengee === message.client.user) {
            await challengeMessage.edit(`<@${challenger.id}> has challenged AI! Skipping to game...`);
        } else { // Send out challenge and wait for it!
            try {
                await message.channel.awaitMessages(
                    m => m.content.startsWith('I accept') && m.author === challengee,
                    { max: 1, time: 6000, errors: ['time'] }
                );
            } catch (warn) {
                return message.channel.client.emit(
                    'channelInfo',
                    message.channel,
                    `Time expired for connect 4 challenge between <@${challenger.id}> and <@${challengee.id}>`
                );
            }
        }
        // Create new game object literal (class would be overkill? but you could make one)
        const outerScope = this;
        const game       = {
            // Properties
            board: new Board(outerScope.boardHeight, outerScope.boardWidth),
            players: [challenger, challengee],
            boardMessage: await message.channel.send('Initializing...'),
            turnMessage: await message.channel.send('Initializing...'),
            turn: 1,
            state: {
                win: false,
                draw: false
            },
            exit: false,
            // Methods
            get gameOver () {
                return game.state.win || game.state.draw || game.state.exit;
            },
            get currentPlayer () {
                return this.players[this.turn - 1];
            },
            get nonCurrentPlayer () {
                return this.getOtherPlayer(this.currentPlayer);
            },
            getOtherPlayer: function (player) {
                return player === this.players[0] ? this.players[1] : this.players[0];
            },
            nextMove: async function () {
                let move = -1;
                if (game.players[game.turn - 1].bot) {
                    move = mcts(game.board, game.turn);
                } else {
                    let filter = (reaction, user) => {
                        return game.currentPlayer.id === user.id && outerScope.emojiPlays.includes(reaction.emoji.identifier);
                    };

                    let collected = await game.boardMessage.awaitReactions(filter, { max: 1 });
                    let reaction  = collected.first();

                    move = parseInt(reaction.emoji.identifier.slice(0, 1), 10);
                    await reaction.users.remove(game.currentPlayer.id);
                    console.log(move);
                }
                return move;
            },
            makeMove: (move) => game.board.makeMoveAndCheckWin(game.turn, move),
            updateTurnMessage: async function (str) {
                await game.turnMessage.edit(str || `<@${game.currentPlayer.id}>'s turn`);
            },
            updateBoardMessage: async function (str) {
                await game.boardMessage.edit(str || `\`\`\`${game.board.toString()}\`\`\``);
            },
            updateState: async function (state = { win: false, draw: false }) {
                game.state = state;
                if (!game.win && !game.draw) {
                    game.turn = (game.turn === 1 ? 2 : 1);
                }
            },
            updateView: async function () {
                await game.updateBoardMessage();
                await game.updateTurnMessage();
            }
        };

        // Push new game and update embed
        const gameID = this.games.push(game);
        logger.debug(`New connect 4 game (ID: ${gameID}) has started.`, game);

        // Set up emojis for game message
        for (let emoji of this.emojiPlays) {
            try {
                await game.boardMessage.react(emoji);
            } catch (err) {
                return game.boardMessage.client.emit('channelError', game.boardMessage.channel, err);
            }
        }

        // First turn!
        await game.updateView();

        // Game Event Loop
        while (!game.gameOver) {
            try {
                let move = await game.nextMove();
                let state = game.makeMove(move);
                await game.updateState(state);
                await game.updateView();
            } catch (err) {
                game.boardMessage.client.emit('channelError', game.boardMessage.channel, err);
                game.exit = true;
            }
        }

        // Final update
        await game.updateBoardMessage();
        await game.updateTurnMessage('Game finished.');

        // Results Message
        await game.turnMessage.channel.send(`Game #${gameID} has ended\n\t${game.state.win ? `<@${game.nonCurrentPlayer.id}> WINS` : `Game ended in draw!`}`);
    }
}

module.exports = Connect4;
