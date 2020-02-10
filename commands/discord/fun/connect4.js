/* eslint-disable no-await-in-loop */
const connect4 = module.exports;
const mcts     = xrequire('./commands/__packages/connect4/Mcts');
const Board    = xrequire('./commands/__packages/connect4/Board');
const logger   = xrequire('./managers/LogManager').getInstance();

const numberEmojiSuffix = '%E2%83%A3';
const whiteFlagEmoji    = '%F0%9F%8F%B3';

// ! Rate limit on reaction based moves!
connect4.getControlEmojis = () => this.emojiPlays.concat([whiteFlagEmoji]);

/* eslint-disable no-unused-vars */
connect4.load = (commandDefinition) => {
    // Default board size
    this.boardWidth  = 7;
    this.boardHeight = 6;

    // Command state & emojis
    this.games      = [];
    this.emojiPlays = [];

    for (let i = 0; i < this.boardWidth; i++) {
        this.emojiPlays.push(i + numberEmojiSuffix);
    }
};

connect4.execute = async (message) => {
    if (message.parsed.args.length < 1) {
        return message.client.emit(
            'invalidCommandUsage',
            message,
            `You need to challenge someone. Invalid #args.`
        );
    }

    // Sort out challenge request
    const challenger = message.author;
    const challengee = message.mentions.users.first() || message.client.user;

    // Let them know we mean business
    const challengeMessage = await message.channel.send(
        `<@${challenger.id}> has challenged <@${challengee.id}> for a connect 4 game!\n\`Challengee may accept by typing: 'I accept'\`.`
    );

    if (challengee === message.client.user) {
        await challengeMessage.edit(`<@${challenger.id}> has challenged AI! Skipping to game...`);
    } else { // Send out challenge and wait for it!
        try {
            await message.channel.awaitMessages(
                (m) => m.content.toLowerCase().startsWith('i accept') && (m.author === challengee),
                { max: 1, time: 20000, errors: ['time'] }
            );
        } catch (warn) {
            return message.channel.client.emit(
                'channelInformation',
                message.channel,
                `Time expired for connect 4 challenge between <@${challenger.id}> and <@${challengee.id}>`
            );
        }
    }

    // ! Could really outsource this to a class
    // Create new game object literal (class would be overkill? but you could make one)
    const outerScope = this;
    const game       = {
        // Properties
        board       : new Board(outerScope.boardHeight, outerScope.boardWidth),
        players     : [challenger, challengee],
        winner      : null,
        boardMessage: await message.channel.send('Initializing...'),
        turnMessage : await message.channel.send('Initializing...'),
        turn        : 1,
        state       : {
            win : false,
            draw: false
        },
        exit: false,
        // Methods
        get gameOver () {
            return this.state.win || this.state.draw || this.exit;
        },
        get currentPlayer () {
            return this.players[this.turn - 1];
        },
        get nonCurrentPlayer () {
            return this.getOtherPlayer(this.currentPlayer);
        },
        getOtherPlayer (player) {
            return player === this.players[0] ? this.players[1] : this.players[0];
        },
        async nextMove () {
            let move = -1;

            if (this.players[this.turn - 1].bot) {
                move = mcts(this.board, this.turn);
            } else {
                const filter    = (reaction, user) => this.currentPlayer.id === user.id && outerScope.getControlEmojis().includes(reaction.emoji.identifier);
                const collected = await this.boardMessage.awaitReactions(filter, { max: 1 });
                const reaction  = collected.first();

                // console.log(reaction);

                if (reaction.emoji.identifier === whiteFlagEmoji) {
                    move = -1;
                } else {
                    move = parseInt(reaction.emoji.identifier.slice(0, 1), 10);
                }

                await reaction.users.remove(this.currentPlayer.id);
            }

            return move;
        },
        makeMove (move) {
            return this.board.makeMoveAndCheckWin(this.turn, move);
        },
        async resetControls () {
            let reactionsThatNeedRemoving = this.boardMessage.reactions.array().filter((reaction) => reaction.count > 1);

            for (let reaction of reactionsThatNeedRemoving) {
                reaction.users.array().filter((user) => user !== this.boardMessage.client.user).forEach((user) => reaction.users.remove(user.id));
            }
        },
        async updateTurnMessage (str) {
            await this.turnMessage.edit(str || `<@${this.currentPlayer.id}>'s turn`);
        },
        async updateBoardMessage (str) {
            await this.boardMessage.edit(str || `\`\`\`${this.board.toString()}\`\`\``);
        },
        async updateState (state = { win: false, draw: false }) {
            this.state = state;
            if (!this.state.win && !this.state.draw) {
                this.turn = (this.turn === 1 ? 2 : 1);
            } else if (this.state.win) {
                this.winner = this.currentPlayer;
            }
        },
        async updateView () {
            await this.updateBoardMessage();
            await this.updateTurnMessage();
            // --await this.resetControls();
        }
    };

    // Push new game and update embed
    const gameID = this.games.push(game);

    // To avoid rate limit
    let reactionDelay = 0;
    const delayStep   = 800;

    // Set up emojis for game message
    for (let emoji of this.getControlEmojis()) {
        try {
            setTimeout(() => {
                game.boardMessage.react(emoji);
            }, reactionDelay);
        } catch (err) {
            return game.boardMessage.client.emit('channelError', game.boardMessage.channel, err);
        }

        reactionDelay += delayStep;
    }

    // Log start
    logger.debug(`New connect 4 game (ID: ${gameID}) has started.`, game);

    // First turn!
    await game.updateView();

    // Avoid rate limits
    let lastMoveTime = 0;

    // Game Event Loop
    while (!game.gameOver) {
        try {
            let timeFrame = Date.now() - lastMoveTime;

            // ? Reduces amount of rate limits. Not working too well but it's better!
            if (timeFrame <= global.discordRL) {
                continue;
            }

            // Reset Controls
            await game.resetControls();

            // Collect Move
            let move = await game.nextMove();

            // Surrender
            if (move === -1) {
                game.state = {
                    win : true,
                    draw: false
                };
                game.winner = game.nonCurrentPlayer;
            } else {
                let state = game.makeMove(move);

                // Update view
                await game.updateState(state);
                await game.updateView();
            }

            lastMoveTime = Date.now();
        } catch (err) {
            game.boardMessage.client.emit('channelError', game.boardMessage.channel, err);
            game.exit = true;
        }
    }

    // Final update
    await game.updateBoardMessage();
    await game.updateTurnMessage(`Game (${gameID}) finished.\n\t**Result:** ${game.state.win ? `<@${game.winner.id}> won!` : `Game ended in draw!`}`);
};
