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
        let newNode  = new GameNode(newBoard, this.getOtherPlayer(), move);

        if (state['draw']) {
            newNode.winner = 0;
        } else if (state['win']) {
            newNode.winner = this.player;
        }

        return newNode;
    }

    expand () {
        for (let i = 0; i < this.board.getWidth(); i++) {
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
                return child.getOriginatingPlay();
            }
        }

        return -1;
    }

    isExpanded () {
        return this.expanded;
    }

    update (score) {
        this.playouts++;
        this.cumulativeScore += score;
    }

    isTerminal () {
        return this.winner !== -1;
    }

    getBestChild () {
        let bestChild = this.children[0];
        let bestScore = bestChild.getScore();

        for (let child of this.children) {
            if (child.getScore() > bestScore) {
                bestChild = child;
                bestScore = child.getScore();
            }
        }
        return bestChild;
    }

    getOtherPlayer () {
        return this.player === 1 ? 2 : 1;
    }

    getPlayer () {
        return this.player;
    }

    getChildren () {
        return this.children;
    }

    getRandomChild () {
        let allowedMoves = this.board.getAllowedMoves();
        let randomMove   = allowedMoves[Math.floor(Math.random() * allowedMoves.length)];
        return this.getNodeAfterMove(randomMove);
    }

    getScore () {
        return this.cumulativeScore / this.playouts;
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

    getPlayoutCount () {
        return this.playouts;
    }

    getWinner () {
        return this.winner;
    }

    getOriginatingPlay () {
        return this.originatingPlay;
    }
}

module.exports = GameNode;
