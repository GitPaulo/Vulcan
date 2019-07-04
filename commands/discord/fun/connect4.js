const messageEmbeds  = xrequire('./plugins/libs/messageEmbeds');
const Mcts           = xrequire('./structures/packages/connect4/Mcts');
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
                    m => m.content.startsWith('I accept') && m.author == challengee,
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
            boardMessage: await message.channel.send("Initializing..."),
            turnMessage: await message.channel.send("Initializing..."),
            turn: 1,
            win: false,
            draw: false,
            exit: false,
            // Methods
            updateTurn: async function (str) {
                await this.turnMessage.edit(str || `<@${game.players[game.turn - 1].id}>'s turn`);
            },
            updateBoard: async function (str) {
                await this.boardMessage.edit(`\`\`\`${game.board.toString()}\`\`\``);
            },
            nextMove: async function () {
                let move = -1;
                if (this.players[this.turn - 1].bot) {
                    move = Mcts(this.board, this.turn);
                } else {
                    let filter = (reaction, user) => {
                        return this.players[this.turn - 1].id === user.id && outerScope.emojiPlays.includes(reaction.emoji.identifier);
                    };

                    let collected = await this.boardMessage.awaitReactions(filter, { max: 1 });
                    let reaction  = collected.first();

                    move = parseInt(reaction.emoji.identifier.slice(0, 1), 10);
                    await reaction.users.remove(this.players[this.turn - 1].id);

                    return move;
                }
            },
            updateAll: async function () {
                return Promise.all(
                    [this.updateTurn(), this.updateBoard()]
                );
            }
        };

        // Push new game and update embed
        const gameID          = this.games.push(game);
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
        await game.updateAll();

        // Game Event Loop
        while (!game.win && !game.draw && !game.exit) {
            let move = await game.nextMove();

            try {
                let state = game.board.makeMoveAndCheckWin(game.turn, move);
                game.win  = state.win;
                game.draw = state.draw;

                await game.updateBoard();
            } catch (err) {
                game.boardMessage.client.emit('channelError', game.boardMessage.channel, err);
                game.exit = true;
            }

            if (!game.win && !game.draw) {
                game.turn = (game.turn === 1 ? 2 : 1);
            }
        }

        // Final update
        await game.updateBoard();
        await game.updateTurn('Game finished.');

        // Results Message
        await game.turnMessage.channel.send(`Game #${gameID} has ended\n\t${game.win ? `<@${game.players[game.turn - 1].id}> WINS` : `Game ended in draw!`}`);
    }
}

module.exports = Connect4;
