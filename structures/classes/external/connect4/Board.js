class Board {
    constructor (height, width) {
        this.height = height;
        this.width = width;
        // (0,0) is bottom left
        this.state = [];
        for (let i = 0; i < this.height; i++) {
            this.state[i] = [];
            for (let j = 0; j < this.width; j++){
                this.state[i][j] = 0;
            }
        }
    }

    static clone(board) {
        let newBoard = new Board(board.getHeight(), board.getWidth());
        newBoard.setState(board);
        return newBoard;
    }

    setState(board) {
        this.state = board.getState().map( (arr) => arr.slice() );
    }

    getState() {
        return this.state;
    }

    getWidth () {
        return this.width;
    }

    getHeight () {
        return this.height;
    }

    getPieceAt (height, width) {
        return this.state[height][width];
    }

    isValidMove (column) {
        return column >= 0 && column < this.width 
        &&     this.state[this.height - 1][column] === 0;
    }

    getAllowedMoves () {
        let allowedMoves = [];
        for (let i = 0; i < this.width; i++) {
            if (this.isValidMove(i)) allowedMoves.push(i);
        }
        return allowedMoves;
    }

    withinBoard (y, x) {
        return y < this.height && y >= 0
            && x < this.width && x >= 0;
    }

    makeMoveAndCheckWin (player, column) {
        if (!this.isValidMove(column)) {
            throw new Error("Move is not valid");
        }
        let row = this.addPieceAndReturnY(player, column);
        return this.checkWin(player, row, column);
    }

    addPieceAndReturnY (player, column) {
        let y = 0;
        while (y < this.height && this.state[y][column] !== 0) y++;
        if (y >= this.height) return new Error("Move not valid, column already full");
        this.state[y][column] = player;
        return y;
    }

    checkWin (player, y, x) {
        let increments = {
            'horizontally' : [0, 1],
            'vertically'   : [1, 0],
            'diag-up'      : [1, 1],
            'diag-down'    : [-1, 1]
        }

        if (this.checkDraw()) {
            return {
                "win"       : false,
                "draw"      : true,
                "direction" : "nan"
            }
        }

        for (let direction in increments) {
            if (1 + this.countInLine(increments[direction], y, x, player) + this.countInLine(increments[direction].map(x => -x), y, x, player) >= 4) {
                return {
                    "win"       : true,
                    "draw"      : false,
                    "direction" : direction
                }
            }
        }

        return {
            "win"       : false,
            "draw"      : false,
            "direction" : "nan"
        }
    }

    checkDraw () {
        for (let i = 0; i < this.height; i++) {
            if (this.state[this.height - 1][i] === 0)
                return false;
        }
        return true;
    }

    countInLine (increment, y, x, player) {
        let count = 0;
        let nextY = y + increment[0];
        let nextX = x + increment[1];
        while (this.withinBoard(nextY, nextX) && this.state[nextY][nextX] === player) {
            nextY += increment[0];
            nextX += increment[1];
            count++;
        }
        return count;
    }

    toString () {
        let result = "";
        // print array from bottom to top
        for (let i = this.state.length - 1; i >= 0; i--) {
            let row = this.state[i];
            result += "|";
            for(let column of row) {
                let symbol = " ";
                if (column === 1) symbol = "O";
                else if (column === 2) symbol = "X";
                result += "  " + symbol + "  |"; 
            }
            result += "\n";
        }

        return result;
    }
}

module.exports = Board;