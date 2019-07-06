const Board = xrequire('./structures/packages/connect4/Board');

class GameNode {
    constructor (board, player, column) {
        this.board           = board;
        this.player          = player;
        this.expanded        = false;
        this.children        = [];
        this.originatingPlay = column;
        this.winner          = -1;
        this.cumulativeScore = 0;
        this.playouts        = 0;
    }

    getNodeAfterMove (move) {
        let newBoard = Board.clone(this.board);
        let state    = newBoard.makeMoveAndCheckWin(this.player, move);
        let newNode  = new GameNode(newBoard, this.otherPlayer, move);

        if (state.draw) {
            newNode.winner = 0;
        } else if (state.win) {
            newNode.winner = this.player;
        }

        return newNode;
    }

    expand () {
        for (let i = 0; i < this.board.width; i++) {
            if (this.board.isValidMove(i)) {
                let newNode = this.getNodeAfterMove(i);
                this.children.push(newNode);
            }
        }
        this.expanded = true;
    }

    getWinningPlay () {
        if (!this.expanded) {
            this.expand();
        }

        for (let child of this.children) {
            if (child.winner > 0) {
                return child.originatingPlay;
            }
        }

        return -1;
    }

    update (score) {
        this.playouts++;
        this.cumulativeScore += score;
    }

    isTerminal () {
        return this.winner !== -1;
    }

    get bestChild () {
        let bestChild = this.children[0];
        let bestScore = bestChild.score;

        for (let child of this.children) {
            if (child.score > bestScore) {
                bestChild = child;
                bestScore = child.score;
            }
        }
        return bestChild;
    }

    getPayoff (player) {
        if (this.winner === 0) {
            return 0;
        }

        if (this.winner === player) {
            return 1;
        }
        return -1;
    }

    get otherPlayer () {
        return this.player === 1 ? 2 : 1;
    }

    get randomChild () {
        let allowedMoves = this.board.allowedMoves;
        let randomMove   = allowedMoves[Math.floor(Math.random() * allowedMoves.length)];
        return this.getNodeAfterMove(randomMove);
    }

    get score () {
        return this.cumulativeScore / this.playouts;
    }
}

module.exports = GameNode;
