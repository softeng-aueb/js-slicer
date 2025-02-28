const CFGVisualizer = require("./CFGVisualizer");
const BinaryExpression = require("../code-parser-module/domain/BinaryExpression");
const LogicalExpression = require("../code-parser-module/domain/LogicalExpression");
const CFG = require("./domain/CFG");
const CFGNode = require("./domain/CFGNode");
const { forEach, each, forIn } = require("lodash");

/**
 * Helper class used to create sub-CFG's from composite logical expressions.
 */
class LogicalExpressionVisitor {
    constructor(id) {
        this._cfg = new CFG();
        this._id = id;
    }

    /**
     * Explore the tree structure of LogicalExpressions using Post-Order traversal (By level starting from the bottom, left to right).
     *  */
    visit(root) {
        if (!root) {
            console.log("Invalid LogicalExpression tree root!");
            return;
        }

        let stack = [root]; // Helper Stack for each tree traversal
        let postOrderStack = []; // Stack for later usage to achieve post order tree traversal
        let operatorQueue = []; // Queue for ordering the logical expression operators (left to right and by level)

        // Traverse the tree once to fill the post order stack
        while (stack.length > 0) {
            let node = stack.pop();

            postOrderStack.push(node);

            if (node._left) stack.push(node._left);
            if (node._right) stack.push(node._right);
        }

        // Traverse the tree a second time using in-order to arrange operators order
        stack = [];
        let current = root;
        let level = 0;

        while (current !== null || stack.length > 0) {
            while (current !== null) {
                stack.push({ node: current, depth: level });
                if (current instanceof LogicalExpression) {
                    current = current._left;
                    level++; // Increase level when going left
                } else {
                    current = null;
                }
            }

            let item = stack.pop();
            current = item.node;
            level = item.depth;

            if (current instanceof LogicalExpression) {
                operatorQueue.push({
                    operator: current._operator,
                    level: level,
                });
                current = current._right || null;
                level++; // Increase level when going right
            } else {
                current = null;
            }
        }

        // Debug for operators
        console.log("Operators Order: ");
        operatorQueue.forEach((it) => {
            console.log(it.operator + " " + it.level);
        });

        // Use the post order stack and process nodes in the correct order
        // We only process Binary Expressions as nodes, more types to be added later...
        let postOrderNodesQueue = [];

        while (postOrderStack.length > 0) {
            let stmt = postOrderStack.pop();
            if (stmt instanceof BinaryExpression) {
                let postOrderNode = new CFGNode(this._id++, null, stmt, [], null);
                postOrderNodesQueue.push(postOrderNode);
            }
        }

        let CFGNodeLastVisited = [];
        let addToTrue = []; // Helper structures to use in the end to connect
        let addToFalse = []; // nodes with the final True and False nodes

        while (postOrderNodesQueue.length > 0) {
            let currentNode = postOrderNodesQueue.shift();

            // Handle current-previous pairs of expressions
            if (CFGNodeLastVisited.length === 0) {
                CFGNodeLastVisited.push(currentNode);
            } else {
                let previousNode = CFGNodeLastVisited.pop();
                let operatorObj = operatorQueue.shift();

                // Handle operator specifics to connect the nodes
                let operatorSym = operatorObj.operator;
                let operatorLvl = operatorObj.level;
                if (operatorSym === "||") {
                    if (operatorLvl === 0) {
                        // If expression is true, connect previous node with final True node
                        addToTrue.push(previousNode);
                    } else {
                        // If expression is true, connect previous node with the next node
                        // if there is no other next node, connect with final True node
                        if (operatorQueue.length > 0) {
                            let copyNodeStack = [...postOrderNodesQueue];
                            let copyOperatorQueue = [...operatorQueue];
                            let nextNode = null;
                            while (copyNodeStack.length > 0) {
                                // Find next node on the same level or higher
                                let temp = copyNodeStack.shift();
                                let copyOp = copyOperatorQueue.shift();
                                if (copyOp.level <= operatorLvl && copyOp.operator === "&&") {
                                    nextNode = temp;
                                    break;
                                }
                            }
                            //If no other next node found on the same level or higher, connect with True node
                            if (!nextNode) {
                                addToTrue.push(previousNode);
                            } else {
                                previousNode.addOutgoingEdge(nextNode, true);
                            }
                        } else {
                            addToTrue.push(previousNode);
                        }
                    }

                    CFGNodeLastVisited.push(currentNode);

                    // If false, connect to current node
                    previousNode.addOutgoingEdge(currentNode, false);

                    this._cfg.addNode(previousNode);
                } else if (operatorSym === "&&") {
                    if (operatorLvl === 0) {
                        // If expression is false, connect previous node with final False node
                        addToFalse.push(previousNode);
                    } else {
                        // If expression is false, connect previous node with the next node
                        // if there is no other next node, connect with final False node
                        if (operatorQueue.length > 0) {
                            let copyNodeStack = [...postOrderNodesQueue];
                            let copyOperatorQueue = [...operatorQueue];
                            let nextNode = null;
                            while (copyNodeStack.length > 0) {
                                // Find next node on the same level or higher
                                let temp = copyNodeStack.shift();
                                let copyOp = copyOperatorQueue.shift();
                                if (copyOp.level <= operatorLvl && copyOp.operator === "||") {
                                    nextNode = temp;
                                    break;
                                }
                            }
                            //If no other next node found on the same level or higher, connect with False node
                            if (!nextNode) {
                                addToFalse.push(previousNode);
                            } else {
                                previousNode.addOutgoingEdge(nextNode, false);
                            }
                        } else {
                            addToFalse.push(previousNode);
                        }
                    }
                    CFGNodeLastVisited.push(currentNode);
                    // If true, connect to current node
                    previousNode.addOutgoingEdge(currentNode, true);
                    this._cfg.addNode(previousNode);
                }
            }
            // If current node is the final expression in the condition
            // it decides the final outcome of the condition
            if (operatorQueue.length === 0) {
                addToFalse.push(currentNode);
                addToTrue.push(currentNode);
                this._cfg.addNode(currentNode);
            }
        }

        // Create final True and False nodes
        let falseNode = new CFGNode(this._id++, null, null, [], null);
        let trueNode = new CFGNode(this._id++, null, null, [], null);

        for (const n of addToFalse) {
            n.addOutgoingEdge(falseNode, false);
        }
        for (const n of addToTrue) {
            n.addOutgoingEdge(trueNode, true);
        }

        this._cfg.addNode(falseNode);
        this._cfg.addNode(trueNode);

        // Print cfg for debugging
        let visualizer = new CFGVisualizer(this._cfg, "LogicExprVisitor");
        visualizer.exportToDot();
    }
}

module.exports = LogicalExpressionVisitor;
