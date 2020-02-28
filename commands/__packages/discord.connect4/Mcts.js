const GameNode   = xrequire('./commands/__packages/discord.connect4/GameNode');
const TIME_LIMIT = 1000;

const C = Math.sqrt(2);

function getPlay (board, player) {
    let node        = new GameNode(board, player);
    let winningPlay = node.getWinningPlay();

    if (winningPlay >= 0) {
        return winningPlay;
    }

    mcts(node, player);
    let bestNode = node.bestChild;

    return bestNode.originatingPlay;
}

function mcts (node, player) {
    let startTime = new Date();

    while (new Date() - startTime < TIME_LIMIT) {
        simulate(node, player);
    }
}

function simulate (node, player) {
    let result = null;

    if (!node.expanded) {
        node.expand();

        let playoutResult = playout(node, player);

        node.update(playoutResult);

        result = playoutResult;
    } else {
        if (node.isTerminal()) {
            return node.getPayoff(player);
        }

        let newNode = select(node, player);
        let payoff  = simulate(newNode, player);

        node.update(payoff);

        result = payoff;
    }

    return result;
}

function playout (node, player) {
    let currentNode = node;

    while (!currentNode.isTerminal()) {
        if (currentNode.getWinningPlay() >= 0) {
            return currentNode.player === player ? 1 : -1;
        }

        currentNode = currentNode.randomChild;
    }

    return currentNode.getPayoff(player);
}

function select (node) {
    let bestNode  = node.children[0];
    let bestScore = bestNode.score;

    for (let child of node.children) {
        if (child.playouts === 0) {
            return child;
        }

        let score = calculateUCT(child, node.playouts);

        if (score > bestScore) {
            bestScore = score;
            bestNode  = child;
        }
    }

    return bestNode;
}

function calculateUCT (node, parentPlayoutCount) {
    let logOfPlayoutCount  = Math.log(parentPlayoutCount);
    let childPlayoutsRatio = logOfPlayoutCount / node.playouts;
    let rootOfRatio        = Math.sqrt(childPlayoutsRatio);
    let rootTimesC         = C * rootOfRatio;
    let totalScore         = node.score + rootTimesC;

    return totalScore;
}

module.exports = getPlay;
