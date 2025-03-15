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
        this._nodesToBeIgnored = [];
        this._copyBehaviorNodesList = [];
        this.validBinaryExpressionOperators = [">", "<", "==", "===", "<=", ">=", "!="]; // Used to filter out non logical Binary Expressions
    }

    /**
     * Explore the tree structure of LogicalExpressions using Post-Order traversal (By level starting from the bottom, left to right).
     *  */
    visit(root, parentStack, linkWithPrevious = true) {
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
            if (stmt._argument) stack.push(stmt._argument);
            if (stmt._right) stack.push(stmt._right);
        }

        /**
         * Traverse the tree a second time using in-order to arrange operators order
         */
        let operatorQueue = []; // Queue for ordering the logical expression operators (left to right and by level)
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

        while (reversePostOrderStack.length > 0) {
            reversePostOrderStack.pop().accept(this);
        }

        /**
         * Use the post order queue and create the CFG
         */

        let CFGNodeLastVisited = [];
        let addToTrue = [];
        let addToFalse = [];
        let parentNode = [...parentStack.elements].shift();
        let first = true;
        let prevTreeRootNode;
        // Used for sub conditional tree linking
        if (!linkWithPrevious) {
            let tempCopy = [...this._postOrderNodeQueue];
            prevTreeRootNode = tempCopy.shift();
        }

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
                    if (operatorLvl === 0) {
                        // If expression is true, connect previous node with final True node
                        addToTrue.push(previousNode);
                    } else {
                        // If expression is true, connect previous node with the next node
                        // if there is no other next node, connect with final True node
                        if (operatorQueue.length > 0) {
                            let copyNodeStack = [...this._postOrderNodeQueue];
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

                                nextNode.addParent(previousNode);
                            }
                        } else {
                            addToTrue.push(previousNode);
                        }
                    }

                    // Skip cases of nodes that need to be ignored
                    if (this._nodesToBeIgnored.includes(currentNode)) {
                        CFGNodeLastVisited = [];
                    } else {
                        CFGNodeLastVisited.push(currentNode);
                    }
                    // If false, connect to current node
                    previousNode.addOutgoingEdge(currentNode, false);
                    currentNode.addParent(previousNode);

                    this._cfg.addNode(previousNode);
                } else if (operatorSym === "&&") {
                    if (operatorLvl === 0) {
                        // If expression is false, connect previous node with final False node
                        addToFalse.push(previousNode);
                    } else {
                        // If expression is false, connect previous node with the next node
                        // if there is no other next node, connect with final False node
                        if (operatorQueue.length > 0) {
                            let copyNodeStack = [...this._postOrderNodeQueue];
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
                                nextNode.addParent(previousNode);
                            }
                        } else {
                            addToFalse.push(previousNode);
                        }
                    }
                    // Skip cases of nodes that need to be ignored
                    if (this._nodesToBeIgnored.includes(currentNode)) {
                        CFGNodeLastVisited = [];
                    } else {
                        CFGNodeLastVisited.push(currentNode);
                    }
                    // If true, connect to current node
                    previousNode.addOutgoingEdge(currentNode, true);
                    currentNode.addParent(previousNode);
                    this._cfg.addNode(previousNode);
                }
            }
            // If current node is the final expression in the condition
            // it decides the final outcome of the condition
            if (operatorQueue.length === 0 && !this._nodesToBeIgnored.includes(currentNode)) {
                addToFalse.push(currentNode);
                addToTrue.push(currentNode);
                this._cfg.addNode(currentNode);
            }
        }

        // Create final True and False nodes
        let trueNode = new CFGNode(this._id++, null, null, [], null);
        let falseNode = new CFGNode(this._id++, null, null, [], null);

        for (const n of addToFalse) {
            n.addOutgoingEdge(falseNode, false);
            falseNode.addParent(n);
        }
        for (const n of addToTrue) {
            n.addOutgoingEdge(trueNode, true);
            trueNode.addParent(n);
        }
        // Used for sub conditionals
        if (!linkWithPrevious) {
            parentStack.push(prevTreeRootNode);
        }
        parentStack.push(falseNode);
        parentStack.push(trueNode);

        this._cfg.addNode(falseNode);
        this._cfg.addNode(trueNode);

        // Apply origin/copy logic for node edges in conditional statements
        for (const obj of this._copyBehaviorNodesList) {
            let originNode = obj.origin;
            let copyNode = obj.copy;

            for (const edge of originNode.edges) {
                let targetNode = edge.targetNode;
                let edgeCondition = edge.condition;

                copyNode.addOutgoingEdge(targetNode, edgeCondition);
                targetNode.addParent(copyNode);
            }
        }

        // // Print cfg for debugging
        // let visualizer = new CFGVisualizer(this._cfg, "LogicExprVisitor");
        // visualizer.exportToDot();

        return this._id;
    }

    /**
     * ----- Visiting non leaf statements -----
     */
    visitLogicalExpression(stmt) {
        // Apply De Morgan's laws if negated
        if (stmt.not) {
            stmt._left.not = !stmt._left.not;
            stmt._right.not = !stmt._right.not;
            stmt._operator = stmt._operator === "&&" ? "||" : "&&";
        }
    }

    visitConditionalStatement(stmt) {
        let parentStack = new Stack();
        let condStmtVisitor = new CompositeConditionsVisitor(this._id, this._cfg);
        this._id = condStmtVisitor.visit(stmt.condition, parentStack, false);

        // Keep resulting true (then) and false (alternative) nodes from sub-tree
        // and place them correctly in the CFG later
        let conditionThenNode = parentStack.pop();
        let conditionAlternateNode = parentStack.pop();

        // Get sub tree root and mark as special case when handling it
        // this root node must not be paired with next nodes and should only be used to
        // connect it correctly with the previous in the queue node
        let subTreeRoot = parentStack.pop();
        this._nodesToBeIgnored.push(subTreeRoot);
        this._postOrderNodeQueue.push(subTreeRoot);

        // Create sub CFGs if then or alternate nodes are composite logical expressions
        let isThenLogExpr = false;
        let thenTrueNode;
        let thenFalseNode;

        let isAlternateLogExpr = false;
        let alternateTrueNode;
        let alternateFalseNode;

        let secondVisitor;
        if (stmt._then instanceof LogicalExpression) {
            isThenLogExpr = true;

            parentStack = [];
            parentStack.push(conditionThenNode);

            secondVisitor = new CompositeConditionsVisitor(this._id, this._cfg);
            this._id = secondVisitor.visit(stmt._then, parentStack);

            thenTrueNode = parentStack.pop();
            thenFalseNode = parentStack.pop();
        }
        if (stmt._alternates instanceof LogicalExpression) {
            isAlternateLogExpr = true;

            parentStack = [];
            parentStack.push(conditionAlternateNode);

            secondVisitor = new CompositeConditionsVisitor(this._id, this._cfg);
            this._id = secondVisitor.visit(stmt._argument, parentStack);

            alternateTrueNode = parentStack.pop();
            alternateFalseNode = parentStack.pop();
        }

        // Handle all possible cases
        if (isThenLogExpr && isAlternateLogExpr) {
            this._copyBehaviorNodesList.push({ origin: thenTrueNode, copy: thenFalseNode });
            this._copyBehaviorNodesList.push({ origin: thenTrueNode, copy: alternateTrueNode });
            this._copyBehaviorNodesList.push({ origin: thenTrueNode, copy: alternateFalseNode });
            this._postOrderNodeQueue.push(thenTrueNode);
        } else if (isThenLogExpr && !isAlternateLogExpr) {
            this._copyBehaviorNodesList.push({ origin: thenTrueNode, copy: thenFalseNode });
            this._copyBehaviorNodesList.push({ origin: thenTrueNode, copy: conditionAlternateNode });
            this._postOrderNodeQueue.push(thenTrueNode);
        } else if (!isThenLogExpr && isAlternateLogExpr) {
            this._copyBehaviorNodesList.push({ origin: conditionThenNode, copy: alternateTrueNode });
            this._copyBehaviorNodesList.push({ origin: conditionThenNode, copy: alternateFalseNode });
            this._postOrderNodeQueue.push(conditionThenNode);
        } else if (!isThenLogExpr && !isAlternateLogExpr) {
            this._copyBehaviorNodesList.push({ origin: conditionThenNode, copy: conditionAlternateNode });
            this._postOrderNodeQueue.push(conditionThenNode);
        }
    }
    visitUnaryExpression(stmt) {
        let isNot = false;

        // Handle Not Expressions
        while (stmt instanceof UnaryExpression && stmt._operator === "!") {
            stmt = stmt._argument;
            isNot = !isNot;
        }

        stmt.not = isNot;
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
