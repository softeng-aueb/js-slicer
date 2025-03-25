const CFGVisualizer = require("./CFGVisualizer");
const BinaryExpression = require("../code-parser-module/domain/BinaryExpression");
const LogicalExpression = require("../code-parser-module/domain/LogicalExpression");
const CFG = require("./domain/CFG");
const ConditionalStatement = require("../code-parser-module/domain/ConditionalStatement");
const FunctionCall = require("../code-parser-module/domain/FunctionCall");
const UnaryExpression = require("../code-parser-module/domain/UnaryExpression");
const CFGNode = require("./domain/CFGNode");
const Stack = require("../utils/Stack");

class CompositeConditionsVisitor {
    constructor(id, cfg) {
        this._cfg = !cfg ? new CFG() : cfg;
        this._id = id;
        this._postOrderNodeQueue = [];
        this._specialNodes = [];
        // Used to filter out non logical Binary Expressions
        this.validBinaryExpressionOperators = [">", "<", "==", "===", "<=", ">=", "!="];
        // Lists for nodes that should be placed in the true/false final node
        this._addToTrue = [];
        this._addToFalse = [];
    }

    /**
     * Explore the tree structure of LogicalExpressions using Post-Order traversal (By level starting from the bottom, left to right).
     *  */
    visit(root, parentStack, linkWithPrevious = true, returnTrueFalseNodes = true) {
        if (!root) {
            console.log("Invalid LogicalExpression tree root!");
            return;
        }

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

        // Debug for operators
        console.log(`Visitor ID: ${this._id}`);
        console.log("Operators Order: ");
        operatorQueue.forEach((it) => {
            console.log(it.operator + " " + it.level);
        });

        /**
         * Process statements into CFG nodes and fill the post order queue
         */

        while (reversePostOrderStack.length > 0) {
            reversePostOrderStack.pop().accept(this);
        }

        /**
         * Use the post order queue and create the CFG
         */

        let CFGNodeLastVisited = [];
        let parentNode = [...parentStack.elements].shift();
        let first = true;
        let treeRootNode;
        // Used for sub conditional tree linking
        if (!linkWithPrevious) {
            let tempCopy = [...this._postOrderNodeQueue];
            treeRootNode = tempCopy.shift();
        }

        // The most important algorithm, it connects nodes in pairs based on the operators between them
        while (this._postOrderNodeQueue.length > 0) {
            let currentNode = this._postOrderNodeQueue.shift();

            // Link root node with previous node in stack
            if (first && linkWithPrevious && !parentNode.hasEdgeTo(currentNode.id)) {
                parentNode.addOutgoingEdge(currentNode);
                currentNode.addParent(parentNode);
                first = false;
            } else if (first) {
                first = false;
            }

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
                            this._addToTrue.push(...(previousNode.isNegated ? previousNode.false : previousNode.true));
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
                            this._addToFalse.push(...(previousNode.isNegated ? previousNode.true : previousNode.false));
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
                    this._addToTrue.push(...(currentNode.isNegated ? currentNode.false : currentNode.true));
                    this._addToFalse.push(...(currentNode.isNegated ? currentNode.true : currentNode.false));
                } else {
                    this._addToFalse.push(currentNode);
                    this._addToTrue.push(currentNode);
                }
                this._cfg.addNode(currentNode);
            }
        }
        if (returnTrueFalseNodes) {
            // Create final True and False nodes
            let trueNode = new CFGNode(this._id++, null, null, [], null);
            let falseNode = new CFGNode(this._id++, null, null, [], null);

            for (const n of this._addToFalse) {
                n.addOutgoingEdge(falseNode, false);
                falseNode.addParent(n);
            }
            for (const n of this._addToTrue) {
                n.addOutgoingEdge(trueNode, true);
                trueNode.addParent(n);
            }

            this._cfg.addNode(falseNode);
            this._cfg.addNode(trueNode);

            // Used for sub conditionals
            if (!linkWithPrevious) {
                parentStack.push(treeRootNode);
            }
            parentStack.push(falseNode);
            parentStack.push(trueNode);
        } else {
            // Used for sub conditionals
            if (!linkWithPrevious) {
                parentStack.push(treeRootNode);
            }
        }

        return returnTrueFalseNodes ? this._id : { id: this._id, true: this._addToTrue, false: this._addToFalse };
    }

    /**
     * ----- Visiting non leaf statements -----
     */
    visitLogicalExpression(stmt) {
        //skip
    }

    visitConditionalStatement(stmt) {
        let parentStack = new Stack();
        let condStmtVisitor = new CompositeConditionsVisitor(this._id, this._cfg);
        let condResult = condStmtVisitor.visit(stmt.condition, parentStack, false, false);

        this._id = condResult.id;

        // Get sub tree root and mark as special case when handling it
        // this root node must not be paired with next nodes and should only be used to
        // connect it correctly with the previous in the queue node.
        // It is also used to connect the resulting final true/false nodes with the correct next nodes.
        let conditionRootNode = parentStack.pop();
        this._specialNodes.push(conditionRootNode);
        this._postOrderNodeQueue.push(conditionRootNode);

        // Create sub CFGs if then or alternate nodes are composite logical expressions
        let secondVisitor;

        let connectToTrue = [];
        let connectToFalse = [];

        // Visit and process the then statement
        if (stmt._then) {
            parentStack = new Stack();
            secondVisitor = new CompositeConditionsVisitor(this._id, this._cfg);

            let thenResult = secondVisitor.visit(stmt._then, parentStack, false, false);
            this._id = thenResult.id;

            let thenTreeRoot = parentStack.pop();
            for (const n of condResult.true) {
                n.addOutgoingEdge(thenTreeRoot, true);
                thenTreeRoot.addParent(n);
            }

            connectToTrue.push(...thenResult.true);
            connectToFalse.push(...thenResult.false);
        }

        // Visit and process the alternate statement
        if (stmt._alternates) {
            parentStack = new Stack();
            secondVisitor = new CompositeConditionsVisitor(this._id, this._cfg);

            let altResult = secondVisitor.visit(stmt._alternates, parentStack, false, false);
            this._id = altResult.id;

            let altTreeRoot = parentStack.pop();
            for (const n of condResult.false) {
                n.addOutgoingEdge(altTreeRoot, false);
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
        let parentStack = new Stack();
        let visitResult = secondVisitor.visit(stmt, parentStack, false, false);

        this._id = visitResult.id;

        let argRootNode = parentStack.pop();
        if (argRootNode) {
            this._specialNodes.push(argRootNode);
            this._postOrderNodeQueue.push(argRootNode);

            argRootNode.true = visitResult.true;
            argRootNode.false = visitResult.false;
            argRootNode.isNegated = isNegated;
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
