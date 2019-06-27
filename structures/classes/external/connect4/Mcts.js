const gameNode = xrequire("./structures/classes/external/connect4/GameNode");
const TIME_LIMIT = 1000;
const C = Math.sqrt(2);
    
function getPlay (board, player) {
    let node = new gameNode(board, player);
    let winningPlay = node.getWinningPlay();
    if (winningPlay >= 0) return winningPlay;
    mcts(node, player);
    let bestNode = node.getBestChild();
    return bestNode.getOriginatingPlay();
}

function mcts (node, player) {
    let startTime = new Date();

    while(new Date() - startTime < TIME_LIMIT) {
        simulate(node, player);
    }
}

function simulate (node, player) {
    if (!node.isExpanded()) {
        node.expand();
        let playoutResult = playout(node, player);
        node.update(playoutResult);
        return playoutResult;
    } else {
        if (node.isTerminal()) return node.getPayoff(player);
        let newNode = select(node, player);
        let payoff = simulate(newNode, player);
        node.update(payoff);
        return payoff;
    }
}

function playout (node, player) {
    let currentNode = node;
    while (!currentNode.isTerminal()) {
        if (currentNode.getWinningPlay() >= 0) {
            return currentNode.getPlayer() === player ? 1 : -1;
        }
        currentNode = currentNode.getRandomChild();
    }
    return currentNode.getPayoff(player);
}

function select (node) {
    let bestNode = node.getChildren()[0];
    let bestScore = bestNode.getScore();
    for (let child of node.getChildren()) {
        if(child.getPlayoutCount() === 0) return child;
        let score = calculateUCT(child, node.getPlayoutCount());
        if (score > bestScore) {
            bestScore = score;
            bestNode = child;
        }
    }
    return bestNode;
}

function calculateUCT (node, parentPlayoutCount) {
    let logOfPlayoutCount = Math.log(parentPlayoutCount);
    let childPlayoutsRatio = logOfPlayoutCount / node.getPlayoutCount();
    let rootOfRatio = Math.sqrt(childPlayoutsRatio);
    let rootTimesC = C * rootOfRatio;
    let totalScore = node.getScore() + rootTimesC;
    return totalScore;

}

module.exports = getPlay;