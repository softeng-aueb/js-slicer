const CFGVisualizer = require("./CFGVisualizer");
const BinaryExpression = require("../code-parser-module/domain/BinaryExpression");
const LogicalExpression = require("../code-parser-module/domain/LogicalExpression");
const CFG = require("./domain/CFG");
const ConditionalStatement = require("../code-parser-module/domain/ConditionalStatement");
const FunctionCall = require("../code-parser-module/domain/FunctionCall");
const UnaryExpression = require("../code-parser-module/domain/UnaryExpression");
const CFGNode = require("./domain/CFGNode");
const Stack = require("../utils/Stack");
const DecisionNode = require("./domain/DecisionNode");

class CompositeConditionsVisitor {
    constructor(id, cfg, nesting = -1) {
        this._cfg = !cfg ? new CFG() : cfg;
        this._id = id;
        this._postOrderNodeQueue = [];
        this._specialNodes = [];
        // Used to filter out non logical Binary Expressions
        this.validBinaryExpressionOperators = [">", "<", "==", "===", "<=", ">=", "!="];
        // Lists for nodes that should be placed in the true/false final node
        this._addToTrue = [];
        this._addToFalse = [];
        this._nesting = nesting;
    }

    /**
     * Explore the tree structure of LogicalExpressions using Post-Order traversal (By level starting from the bottom, left to right).
     *  */
    visit(root, returnDecisionNode = true) {
        if (!root) {
            console.log("Invalid Condition tree root!");
            return;
        }

        let reversePostOrderStack = this.createReversePostOrderStack(root);

        let operatorQueue = this.createOperatorsQueue(root);

        this.createPostOrderNodeQueue(reversePostOrderStack);

        /**
         * Use the post order queue and create the condition's full CFG
         */

        let CFGNodeLastVisited = [];

        let tempCopy = [...this._postOrderNodeQueue];
        let treeRootNode = tempCopy.shift();

        // The most important algorithm, it connects nodes in pairs based on the operators between them
        while (this._postOrderNodeQueue.length > 0) {
            let currentNode = this._postOrderNodeQueue.shift();

            // Handle current-previous pairs of expressions
            if (CFGNodeLastVisited.length === 0) {
                CFGNodeLastVisited.push(currentNode);
            } else if (operatorQueue.length > 0) {
                let previousNode = CFGNodeLastVisited.pop();
                let operatorObj = operatorQueue.shift();

                // Handle operator specifics to connect the nodes
                let operatorSym = operatorObj.operator;
                let operatorLvl = operatorObj.level;
                if (operatorSym === "||") {
                    // If expression is true, connect previous node with the next node
                    // if there is no other next node, connect with final True node
                    let copyNodeQueue = [...this._postOrderNodeQueue];
                    let copyOperatorQueue = [...operatorQueue];
                    let nextNode = null;
                    while (copyNodeQueue.length > 0) {
                        // Find next node on the same level or higher
                        let temp = copyNodeQueue.shift();
                        let copyOp = copyOperatorQueue.shift();
                        if (copyOp.level <= operatorLvl && copyOp.operator === "&&") {
                            nextNode = temp;
                            break;
                        }
                    }
                    // If no other next node found on the same level or higher, connect with True node
                    if (!nextNode) {
                        if (this._specialNodes.includes(previousNode)) {
                            this._addToTrue.push(...previousNode.true);
                        } else {
                            this._addToTrue.push(previousNode);
                        }
                    } else {
                        if (this._specialNodes.includes(previousNode)) {
                            for (const n of previousNode.true) {
                                n.addOutgoingEdge(nextNode, previousNode.isNegated ? false : true);
                                nextNode.addParent(n);
                            }
                        } else {
                            previousNode.addOutgoingEdge(nextNode, true);
                            nextNode.addParent(previousNode);
                        }
                    }

                    CFGNodeLastVisited.push(currentNode);

                    // If false, connect to current node
                    if (this._specialNodes.includes(previousNode)) {
                        for (const n of previousNode.false) {
                            n.addOutgoingEdge(currentNode, previousNode.isNegated ? true : false);
                            currentNode.addParent(n);
                        }
                    } else {
                        previousNode.addOutgoingEdge(currentNode, false);
                        currentNode.addParent(previousNode);
                    }

                    this._cfg.addNode(previousNode);
                } else if (operatorSym === "&&") {
                    // If expression is false, connect previous node with the next node
                    // if there is no other next node, connect with final False node

                    let copyNodeQueue = [...this._postOrderNodeQueue];
                    let copyOperatorQueue = [...operatorQueue];
                    let nextNode = null;
                    while (copyNodeQueue.length > 0) {
                        // Find next node on the same level or higher
                        let temp = copyNodeQueue.shift();
                        let copyOp = copyOperatorQueue.shift();
                        if (copyOp.level <= operatorLvl && copyOp.operator === "||") {
                            nextNode = temp;
                            break;
                        }
                    }
                    // If no other next node found on the same level or higher, connect with False node
                    if (!nextNode) {
                        if (this._specialNodes.includes(previousNode)) {
                            this._addToFalse.push(...previousNode.false);
                        } else this._addToFalse.push(previousNode);
                    } else {
                        if (this._specialNodes.includes(previousNode)) {
                            for (const n of previousNode.false) {
                                n.addOutgoingEdge(nextNode, previousNode.isNegated ? true : false);
                                nextNode.addParent(n);
                            }
                        } else {
                            previousNode.addOutgoingEdge(nextNode, false);
                            nextNode.addParent(previousNode);
                        }
                    }

                    CFGNodeLastVisited.push(currentNode);

                    // If true, connect to current node
                    if (this._specialNodes.includes(previousNode)) {
                        for (const n of previousNode.true) {
                            n.addOutgoingEdge(currentNode, previousNode.isNegated ? false : true);
                            currentNode.addParent(n);
                        }
                    } else {
                        previousNode.addOutgoingEdge(currentNode, true);
                        currentNode.addParent(previousNode);
                    }
                    this._cfg.addNode(previousNode);
                }
            }
            // If current node is the final expression in the condition
            // it decides the final outcome of the condition
            if (operatorQueue.length === 0) {
                if (this._specialNodes.includes(currentNode)) {
                    this._addToTrue.push(...currentNode.true);
                    this._addToFalse.push(...currentNode.false);
                } else {
                    this._addToFalse.push(currentNode);
                    this._addToTrue.push(currentNode);
                }
                this._cfg.addNode(currentNode);
            }
        }

        return returnDecisionNode
            ? new DecisionNode(treeRootNode, this._addToTrue, this._addToFalse, this._nesting)
            : { id: this._id, true: this._addToTrue, false: this._addToFalse, root: treeRootNode };
    }

    /**
     *  ------ Helper functions ------
     */
    createReversePostOrderStack(root) {
        let stack = [root]; // Helper Stack for each tree traversal

        /*
         * Traverse the tree once to create a temp reverse post order stack
         */

        let reversePostOrderStack = [];
        while (stack.length > 0) {
            let stmt = stack.pop();

            reversePostOrderStack.push(stmt);

            if (stmt._left) stack.push(stmt._left);
            if (stmt._right) stack.push(stmt._right);
        }

        return reversePostOrderStack;
    }

    createOperatorsQueue(root) {
        /**
         * Traverse the tree a second time using in-order to arrange operators order
         */
        let operatorQueue = []; // Queue for ordering the logical expression operators (left to right)
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

        // // Debug for operators
        // console.log(`Visitor ID: ${this._id}`);
        // console.log("Operators Order: ");
        // operatorQueue.forEach((it) => {
        //     console.log(it.operator + " " + it.level);
        // });

        /**
         * Process statements into CFG nodes and fill the post order queue
         */

        return operatorQueue;
    }

    createPostOrderNodeQueue(reversePostOrderStack) {
        while (reversePostOrderStack.length > 0) {
            reversePostOrderStack.pop().accept(this);
        }
    }

    /**
     * ----- Visiting non leaf statements -----
     */

    visitLogicalExpression(stmt) {
        //skip
    }

    visitConditionalStatement(stmt) {
        let condStmtVisitor = new CompositeConditionsVisitor(this._id, this._cfg);
        let condResult = condStmtVisitor.visit(stmt.condition, false);

        this._id = condResult.id;

        // Get sub tree root and mark as special case when handling it
        // this root node must not be paired with next nodes and should only be used to
        // connect it correctly with the previous in the queue node.
        // It is also used to connect the resulting final true/false nodes with the correct next nodes.
        let conditionRootNode = condResult.root;
        this._specialNodes.push(conditionRootNode);
        this._postOrderNodeQueue.push(conditionRootNode);

        // Create sub CFGs if then or alternate nodes are composite logical expressions
        let secondVisitor;

        let connectToTrue = [];
        let connectToFalse = [];

        // Visit and process the then statement
        if (stmt._then) {
            secondVisitor = new CompositeConditionsVisitor(this._id, this._cfg);

            let thenResult = secondVisitor.visit(stmt._then, false);
            this._id = thenResult.id;

            let thenTreeRoot = thenResult.root;
            for (const n of condResult.true) {
                n.addOutgoingEdge(thenTreeRoot, n.isNegated ? false : true);
                thenTreeRoot.addParent(n);
            }

            connectToTrue.push(...thenResult.true);
            connectToFalse.push(...thenResult.false);
        }

        // Visit and process the alternate statement
        if (stmt._alternates) {
            secondVisitor = new CompositeConditionsVisitor(this._id, this._cfg);

            let altResult = secondVisitor.visit(stmt._alternates, false);
            this._id = altResult.id;

            let altTreeRoot = altResult.root;
            for (const n of condResult.false) {
                n.addOutgoingEdge(altTreeRoot, n.isNegated ? true : false);
                altTreeRoot.addParent(n);
            }

            connectToTrue.push(...altResult.true);
            connectToFalse.push(...altResult.false);
        }

        for (const n of connectToFalse) {
            this._cfg.addNode(n);
        }
        for (const n of connectToTrue) {
            this._cfg.addNode(n);
        }

        conditionRootNode.true = connectToTrue;
        conditionRootNode.false = connectToFalse;
    }

    visitUnaryExpression(stmt) {
        // Handle Not Expressions
        let isNegated = false;
        while (stmt instanceof UnaryExpression && stmt._operator === "!") {
            isNegated = !isNegated;
            stmt = stmt._argument;
        }

        // Visit and process the arguement statement
        let secondVisitor = new CompositeConditionsVisitor(this._id, this._cfg);

        let visitResult = secondVisitor.visit(stmt, false);

        this._id = visitResult.id;

        let argRootNode = visitResult.root;

        this._specialNodes.push(argRootNode);
        this._postOrderNodeQueue.push(argRootNode);

        argRootNode.isNegated = isNegated;
        if (isNegated) {
            argRootNode.true = visitResult.false;
            argRootNode.false = visitResult.true;

            // Add a negation tag for all reversed nodes for correct edge labels when linking to final True/False nodes
            for (const n of argRootNode.true) {
                n.isNegated = true;
            }
            for (const n of argRootNode.false) {
                n.isNegated = true;
            }
        } else {
            argRootNode.true = visitResult.true;
            argRootNode.false = visitResult.false;
        }
    }

    /**
     * ----- Visiting Leaf Statements -----
     */
    visitBinaryExpression(stmt) {
        // Only keep logical binary expressions
        if (this.validBinaryExpressionOperators.includes(stmt._operator)) {
            let node = new CFGNode(this._id++, null, stmt, [], null);
            this._postOrderNodeQueue.push(node);
        }
    }
    visitFunctionCall(stmt) {
        let node = new CFGNode(this._id++, null, stmt, [], null);
        this._postOrderNodeQueue.push(node);
    }

    /**
     * ----- Visiting others -----
     */
    visitLiteral(stmt) {
        //skip
    }
    visitIdentifier(stmt) {
        //skip
    }
}

module.exports = CompositeConditionsVisitor;
