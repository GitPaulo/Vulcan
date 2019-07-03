const connect4       = module.exports;
const messageEmbeds  = xrequire('./plugins/libs/messageEmbeds');
const Mcts           = xrequire('./structures/packages/connect4/Mcts');
const Board          = xrequire('./structures/packages/connect4/Board');
const logger         = xrequire('./managers/LogManager').getInstance();

const numberEmojiSuffix = '%E2%83%A3';

connect4.load = (commandDefinition) => {
    // Default board size
    this.boardWidth  = 7;
    this.boardHeight = 6;

    // Command state & emojis
    this.games       = [];
    this.emojiPlays  = [];

    for (let i = 0; i < this.boardWidth; i++) {
        this.emojiPlays.push(i + numberEmojiSuffix);
    }
};

connect4.execute = async (message) => {
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
                m => m.content.startsWith('I accept'),
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

    // Command Embed
    const value     = 'Initialising...';
    const boardWrap = messageEmbeds.reply({
        replyeeMessage: message,
        title: `Connect4 - Loading...`,
        description: '[============== L O A D I N G ==============]',
        fields: [
            { name: 'Challenger',  value: `<@${challenger.id}>`, inline: true },
            { name: 'Challengee',  value: `<@${challengee.id}>`, inline: true },
            { name: 'Turn',        value,                        inline: true },
            { name: 'Last Played', value,                        inline: true },
            { name: 'State',       value,                        inline: true },
            { name: 'Start Date',  value: Date.now(),             inline: true }
        ]
    });

    // Create new game object literal (class would be overkill? but you could make one)
    const outerScope = this;
    const game       = {
        // Properties
        board: new Board(this.boardHeight, this.boardWidth),
        players: [challenger, challengee],
        message: await message.channel.send(boardWrap),
        turn: 1,
        win: false,
        draw: false,
        exit: false,
        // Methods
        updateTurn: async function (str) {
            boardWrap.embed.fields[2].value = str || `<@${game.players[game.turn - 1].id}>'s turn`;
            await this.message.edit(boardWrap);
        },
        updateBoard: async function (str) {
            boardWrap.embed.description = str || `\`\`\`${game.board.toString()}\`\`\``;
            await this.message.edit(boardWrap);
        },
        updateState: async function (str) {
            boardWrap.embed.fields[4].value = str || ((this.win || this.draw || this.exit)
            ? 'finished'
            : 'on-going');
            await this.message.edit(boardWrap);
        },
        updateLastPlayed: async function (str) {
            boardWrap.embed.fields[3].value = str || this.board.lastMove
                ? `Column: ${this.board.lastMove.column} Row: ${this.board.lastMove.row}`
                : 'No player has played!';
            await this.message.edit(boardWrap);
        },
        nextMove: async function () {
            let move = -1;
            if (this.players[this.turn - 1].bot) {
                move = Mcts(this.board, this.turn);
            } else {
                let filter = (reaction, user) => {
                    return this.players[this.turn - 1].id === user.id && outerScope.emojiPlays.includes(reaction.emoji.identifier);
                };

                let collected = await this.message.awaitReactions(filter, { max: 1 });
                let reaction  = collected.first();

                move = parseInt(reaction.emoji.identifier.slice(0, 1), 10);
                await reaction.users.remove(this.players[this.turn - 1].id);

                return move;
            }
        },
        updateAll: async function () {
            return Promise.all(
                [this.updateTurn(), this.updateBoard(), this.updateState(), this.updateLastPlayed()]
            );
        }
    };

    // Push new game and update embed
    const gameID          = this.games.push(game);
    boardWrap.embed.title = 'Connect4 - Game #' + gameID;
    logger.debug(`New connect 4 game (ID: ${gameID}) has started.`, game);

    await game.message.edit(boardWrap);

    // Set up emojis for game message
    for (let emoji of this.emojiPlays) {
        try {
            await game.message.react(emoji);
        } catch (err) {
            return this.client.emit('channelError', message.channel, err);
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
        } catch (e) {
            console.log(e); // what is this? Error? if error return and emit channel error event!
            game.exit = true;
        }

        if (!game.win && !game.draw) {
            game.turn = (game.turn === 1 ? 2 : 1);
        }

        await game.updateLastPlayed();
        await game.updateTurn();
    }

    // Final update
    await game.updateBoard();
    await game.updateState('Game finished.');

    // Results Message
    await message.channel.send(`Game #${gameID} has ended\n\t${game.win ? `<@${game.players[game.turn - 1].id}> WINS` : `Game ended in draw!`}`);
};
