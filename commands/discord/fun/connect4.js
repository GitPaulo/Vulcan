const connect4 = module.exports;
const mcts     = xrequire('./structures/packages/connect4/Mcts');
const Board    = xrequire('./structures/packages/connect4/Board');
const logger   = xrequire('./managers/LogManager').getInstance();

const numberEmojiSuffix = '%E2%83%A3';

connect4.load = (vulcan, commandDefinition) => {
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

connect4.execute = async (message) => {
    if (message.parsed.args.length < 1) {
        return message.client.emit('invalidCommandCall', `You need to challenge someone. Invalid #args.`, message);
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
                (m) => m.content.startsWith('I accept') && m.author === challengee,
                { max: 1, time: 20000, errors: ['time'] }
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
    	    return this.state.win || this.state.draw || this.state.exit;
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
                let filter    = (reaction, user) => this.currentPlayer.id === user.id && outerScope.emojiPlays.includes(reaction.emoji.identifier);
                let collected = await this.boardMessage.awaitReactions(filter, { max: 1 });
		        let reaction  = collected.first();

                move = parseInt(reaction.emoji.identifier.slice(0, 1), 10);
                await reaction.users.remove(this.currentPlayer.id);
                console.log(move);
 	        }
      	    return move;
	    },
     	makeMove (move) { 
             this.board.makeMoveAndCheckWin(this.turn, move)
        },
	    async updateTurnMessage (str) {
    	    await this.turnMessage.edit(str || `<@${this.currentPlayer.id}>'s turn`);
        },
        async updateBoardMessage (str) {
  	        await this.boardMessage.edit(str || `\`\`\`${this.board.toString()}\`\`\``);
        },
	    async updateState (state = { win: false, draw: false }) {
	        this.state = state;
    	    if (!this.win && !this.draw) {
		        this.turn = (this.turn === 1 ? 2 : 1);
	        }
	    },
    	async updateView () {
	        await this.updateBoardMessage();
    	    await this.updateTurnMessage();
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
};

