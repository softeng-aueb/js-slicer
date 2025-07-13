const ConditionalStatement = require("../code-parser-module/domain/ConditionalStatement");
const CFGNode = require("./domain/CFGNode");
const CFG = require("./domain/CFG");
const Stack = require("../utils/Stack");
const CompositeConditionsVisitor = require("./CompositeConditionsVisitor");
const CFGVisualizer = require("./CFGVisualizer");
const JoinNode = require("./domain/JoinNode");
const ReturnStatement = require("../code-parser-module/domain/ReturnStatement");
const BreakStatement = require("../code-parser-module/domain/BreakStatement");
const ContinueStatement = require("../code-parser-module/domain/ContinueStatement");
const LoopStatement = require("../code-parser-module/domain/LoopStatement");

class CFGVisitor {
    constructor(debug = false) {
        this._cfg = new CFG();
        this._id = 1;
        this._parentStack = new Stack();
        this.nesting = 0;
        this._visualizer = new CFGVisualizer();
        this._returnExitStack = [];
        this._loopJumpNodeRecords = [];
        this._doWhileLoopBackTargets = [];
        this._debug = debug;
    }

    // Implements connection algorithm logic
    connectNodeToCFG(node) {
        //Debug
        if (this._debug) {
            let printStr2 = "";
            this._parentStack.elements.forEach((it) => {
                printStr2 = printStr2.concat(`${it.id} `);
            });
            console.log(`Starting Parent Stack: ${printStr2}`);
        }

        if (this._parentStack.length === 0) {
            this._parentStack.push(node);
        } else {
            let previousNode = this._parentStack.pop();
            previousNode.addNextNode(node);

            // Do not remove nodes with dangling edges
            if (previousNode.hasDanglingEdges()) {
                this._parentStack.push(previousNode);
            }

            this._parentStack.push(node);
        }

        //Debug
        if (this._debug) {
            let printStr1 = "";
            this._parentStack.elements.forEach((it) => {
                printStr1 = printStr1.concat(`${it.id} `);
            });

            console.log(`Parent Stack: ${printStr1}`);
        }
    }

    visitArrayExpression(stmt) {
        for (let elem of stmt.elements) {
            elem.accept(this);
        }
    }

    visitUpdateExpression(stmt) {
        this.visitSequentialStatement(stmt);
    }

    visitBlockStatement(block) {
        this.nesting++;
        // This variable holds the returned exit nodes from if statements and is used to create a JoinNode object that holds the nodes
        // and is pushed in the parent stack to be connected with the immediate next node then removed.
        let exitNodes = null;

        let stmts = block._stmts;

        for (let stmt of stmts) {
            if (stmt instanceof ReturnStatement || stmt instanceof BreakStatement || stmt instanceof ContinueStatement) {
                stmt.accept(this);
                this.nesting--;
                return null;
            }

            exitNodes = stmt.accept(this);

            if (exitNodes) {
                this._parentStack.push(exitNodes);
            }
        }

        this.nesting--;

        let result = stmts.length > 0 ? this._parentStack.pop() : null;
        return result;
    }

    visitForEachStatement(stmt, isCalledAsFirstOnDoWhile = false) {
        return this.visitLoopStatement(stmt, false, isCalledAsFirstOnDoWhile);
    }

    visitDoWhileStatement(stmt, isCalledAsFirstOnDoWhile = false) {
        // Create a record for all break/continue nodes related to this loop only
        let currentLoopJumpNodes = {};

        currentLoopJumpNodes.breaks = [];
        currentLoopJumpNodes.continues = [];

        this._loopJumpNodeRecords.push(currentLoopJumpNodes);

        // Special handling for first expression needed in order to obtain a valid loopback target for the condition
        let firstBlockNode = null;
        let first = stmt.body.stmts.splice(0, 1)[0];
        if (first instanceof ConditionalStatement || first instanceof LoopStatement) {
            let exitNodes = first.accept(this, true);
            firstBlockNode = this._doWhileLoopBackTargets.pop();

            if (exitNodes /*&& exitNodes.list.length > 0*/) {
                this._parentStack.push(exitNodes);
            }
        } else {
            first.accept(this);
            firstBlockNode = this._parentStack.peek();
        }

        if (isCalledAsFirstOnDoWhile) {
            this._doWhileLoopBackTargets.push(firstBlockNode);
        }
        let loopBackNode = this.visitBlockStatement(stmt.body);
        // Loopback node is null only when the dowhile block has one statement and that statement
        // is either a conditional or another loop.
        // In that case, The loopback node will be a join node found in the parent stack.
        if (!loopBackNode) {
            loopBackNode = this._parentStack.pop();
        }

        // In Do...While the condition must be parsed last
        let conditionNode = this.visitLogicalExpression(stmt.condition, this.nesting);

        currentLoopJumpNodes = this._loopJumpNodeRecords.pop();

        let loopJoinExitNode = new JoinNode();

        // Handle exit nodes
        for (const breakNode of currentLoopJumpNodes.breaks) {
            loopJoinExitNode.merge(breakNode);
        }
        loopJoinExitNode.merge(conditionNode);

        // Handle loopback nodes

        for (const continueNode of currentLoopJumpNodes.continues) {
            continueNode.addNextNode(conditionNode);
        }
        loopBackNode.addNextNode(conditionNode);

        // In Do...While the loop back target is the first statement in the loop's block
        conditionNode.addNextNode(firstBlockNode);

        //Debug
        if (this._debug) {
            let printStr = "";
            loopJoinExitNode.list.forEach((it) => {
                printStr = printStr.concat(`${it.id} `);
            });
            console.log(`${stmt.type} ${conditionNode.id} ended with return list: ${printStr}`);
        }
        return loopJoinExitNode;
    }

    visitWhileStatement(stmt, isCalledAsFirstOnDoWhile = false) {
        return this.visitLoopStatement(stmt, false, isCalledAsFirstOnDoWhile);
    }

    visitForStatement(stmt, isCalledAsFirstOnDoWhile = false) {
        this.visitSequentialStatement(stmt.init);

        // If called as the first expression of do..while push the init node.
        if (isCalledAsFirstOnDoWhile) {
            this._doWhileLoopBackTargets.push(this._parentStack.peek());
        }

        // add update expression as the last statement of the for body
        stmt.body.stmts.push(stmt.update);
        let loopJoinExitNode = this.visitLoopStatement(stmt, true);
        stmt.body.stmts.pop();

        return loopJoinExitNode;
    }

    visitLoopStatement(stmt, hasUpdateExpression = false, isCalledAsFirstOnDoWhile = false) {
        if (!stmt) return;

        let conditionNode = this.visitLogicalExpression(stmt.condition, this.nesting);
        this.connectNodeToCFG(conditionNode);

        // Create a record for all break/continue nodes related to this loop only
        let currentLoopJumpNodes = {};

        currentLoopJumpNodes.breaks = [];
        currentLoopJumpNodes.continues = [];

        this._loopJumpNodeRecords.push(currentLoopJumpNodes);

        let loopBackNode = this.visitBlockStatement(stmt.body);

        let loopJoinExitNode = new JoinNode();

        currentLoopJumpNodes = this._loopJumpNodeRecords.pop();

        // Handle exit nodes
        for (const breakNode of currentLoopJumpNodes.breaks) {
            loopJoinExitNode.merge(breakNode);
        }
        loopJoinExitNode.merge(conditionNode);

        // Handle loopback nodes
        // If loop has update expression (for example For Loop)
        // then continue nodes should have edges to the update expression,
        // if not then those edges are placed towards the condition node
        for (const continueNode of currentLoopJumpNodes.continues) {
            continueNode.addNextNode(hasUpdateExpression ? loopBackNode : conditionNode);
        }
        loopBackNode.addNextNode(conditionNode);

        // Push the correct node for do while if this loop is
        // a first expression of the block and is a while loop.
        // Case of For loops handled seperately in their own call.
        if (isCalledAsFirstOnDoWhile) {
            if (!hasUpdateExpression) {
                this._doWhileLoopBackTargets.push(conditionNode);
            }
        }

        //Debug
        if (this._debug) {
            let printStr = "";
            loopJoinExitNode.list.forEach((it) => {
                printStr = printStr.concat(`${it.id} `);
            });
            console.log(`${stmt.type} Loop Statement ${conditionNode.id} ended with return list: ${printStr}`);
        }
        return loopJoinExitNode;
    }

    visitConditionalStatement(stmt, isCalledAsFirstOnDoWhile = false) {
        if (!stmt) return;

        let condition = stmt.condition;
        let then = stmt.then;
        let alternates = stmt.alternates;

        let decisionNode;

        if (condition) {
            decisionNode = this.visitLogicalExpression(condition, this.nesting);
            this.connectNodeToCFG(decisionNode);

            if (isCalledAsFirstOnDoWhile) this._doWhileLoopBackTargets.push(decisionNode);
        }

        let conditionalExitsJoinNode = new JoinNode();

        conditionalExitsJoinNode.merge(then.accept(this));
        conditionalExitsJoinNode.merge(alternates ? alternates.accept(this) : this._parentStack.pop());

        //Debug
        if (this._debug) {
            let printStr = "";
            conditionalExitsJoinNode.list.forEach((it) => {
                printStr = printStr.concat(`${it.id} `);
            });
            console.log(`IF Statement ${decisionNode.id} ended with return list: ${printStr}`);
        }

        return conditionalExitsJoinNode;
    }

    visitSwitchStatement(stmt, isCalledAsFirstOnDoWhile = false) {
        this.visitSequentialStatement(stmt.discriminant);
        let discriminant = this._parentStack.pop();
        if (isCalledAsFirstOnDoWhile) {
            this._doWhileLoopBackTargets.push(discriminant);
        }

        let currentBreakNodes = { breaks: [] };
        this._loopJumpNodeRecords.push(currentBreakNodes);

        let switchExitNode = new JoinNode();

        let defaultCase; // locate the default case if exists
        let lastCaseBeforeDefault; // locate and keep the last non default case for connecting with default case or exit node
        let previousCase;

        // ------- connect DN of cases -------
        for (let c of stmt.cases) {
            structuralParse(c, this);
        }

        // when there is only a default case in the statement
        if (discriminant.edges.length === 0 && stmt.cases.length === 1 && defaultCase) {
            this._parentStack.push(discriminant);
            let defaultCaseBlock = this.visitBlockStatement(defaultCase.consequent);
            switchExitNode.merge(defaultCaseBlock);
        }
        if (lastCaseBeforeDefault && !defaultCase) {
            switchExitNode.merge(lastCaseBeforeDefault.test);
        }

        let groupNode = new JoinNode(); // collection of nodes that need to be connected to the next non empty case block
        let currentBlock = new JoinNode();

        for (let c of stmt.cases) {
            caseBlockParse(c, this);
        }

        // swap edge conditions of last case block if default is above it
        if (lastCaseBeforeDefault && defaultCase) {
            let lastCaseIndex = stmt.cases.findIndex((c) => c === lastCaseBeforeDefault);
            let defaultCaseIndex = stmt.cases.findIndex((c) => c === defaultCase);
            if (defaultCaseIndex < lastCaseIndex) {
                for (let edge of lastCaseBeforeDefault.test.getRoot().edges) {
                    edge.condition = !edge.condition;
                }
            }
        }

        currentBreakNodes = this._loopJumpNodeRecords.pop();
        let breakJoinNode = new JoinNode();
        breakJoinNode.list = [...currentBreakNodes.breaks];

        switchExitNode.merge(breakJoinNode);
        switchExitNode.merge(groupNode);
        return switchExitNode;

        function caseBlockParse(c, visitor) {
            if (c !== defaultCase) {
                // connect previous hanging edges or non break blocks to current block through a join node
                // only if current case has non empty block statement
                if (c.consequent.stmts.length > 0) {
                    groupNode.merge(c.test);
                    visitor._parentStack.push(groupNode);
                    currentBlock.merge(visitor.visitBlockStatement(c.consequent));
                    groupNode.list = [];
                    groupNode.merge(currentBlock);
                    currentBlock.list = [];
                }

                // empty block statement, merge with previous similar hanging nodes
                else {
                    groupNode.merge(c.test);
                }
            } else if (c === defaultCase && lastCaseBeforeDefault) {
                groupNode.merge(lastCaseBeforeDefault.test);

                if (defaultCase.consequent.stmts.length > 0) {
                    visitor._parentStack.push(groupNode);
                    currentBlock.merge(visitor.visitBlockStatement(defaultCase.consequent));
                    groupNode.list = [];
                    groupNode.merge(currentBlock);
                    currentBlock.list = [];
                }
            }
        }

        // connect each case's DN and create the control flow structure
        function structuralParse(c, visitor) {
            if (c.test) {
                // convert case test to DN if non default
                c.test = visitor.visitLogicalExpression(c.test, visitor.nesting);
                lastCaseBeforeDefault = c;

                if (previousCase) {
                    // add false edge from previous non default case test to current test
                    previousCase.test.getRoot().addOutgoingEdge(c.test.getRoot(), false);
                    c.test.getRoot().addParent(previousCase.test.getRoot());
                }
                // connect discriminant to first non default case
                else if (discriminant.edges.length === 0) {
                    discriminant.addNextNode(c.test.getRoot());
                }
                previousCase = c;
            } else {
                defaultCase = c;
            }
        }
    }

    visitSwitchCase(stmt) {
        //
    }

    visitSequentialStatement(stmt) {
        let node = new CFGNode(this._id++, null, stmt, [], null);

        node.nesting = this.nesting;
        this.cfg.addNode(node);
        this.connectNodeToCFG(node);
    }

    visitFunctionCall(stmt) {
        this.visitSequentialStatement(stmt);
    }

    visitAssignmentStatement(stmt) {
        this.visitSequentialStatement(stmt);
    }

    visitVariableDeclaration(stmt) {
        for (let i = 0; i < stmt.names.length; i++) {
            this.visitSequentialStatement(stmt.names[i]);
            stmt.values[i].accept(this);
        }
    }

    visitIdentifier(stmt) {}

    visitLiteral(stmt) {}

    visitBinaryExpression(stmt) {
        stmt.left.accept(this);
        stmt.right.accept(this);
    }

    visitUnaryExpression(stmt) {
        stmt.argument.accept(this);
    }

    visitReturnStatement(stmt) {
        this.visitSequentialStatement(stmt);
        // subsequent nodes should not have incoming edges from this node
        this._returnExitStack.push(this._parentStack.pop());
    }

    visitBreakStatement(stmt) {
        this.visitSequentialStatement(stmt);
        // subsequent nodes should not have incoming edges from this node
        let thisNode = this._parentStack.pop();

        //add itself to most recent loop's break nodes record
        let currentLoopRecord = this._loopJumpNodeRecords.pop();
        currentLoopRecord.breaks.push(thisNode);
        this._loopJumpNodeRecords.push(currentLoopRecord);
    }

    visitContinueStatement(stmt) {
        this.visitSequentialStatement(stmt);
        // subsequent nodes should not have incoming edges from this node
        let thisNode = this._parentStack.pop();

        //add itself to most recent loop's continue nodes record
        let currentLoopRecord = this._loopJumpNodeRecords.pop();
        currentLoopRecord.continues.push(thisNode);
        this._loopJumpNodeRecords.push(currentLoopRecord);
    }

    visitMemberExpression(stmt) {
        stmt.property.accept(this);
        stmt.object.accept(this);
    }

    visitLogicalExpression(stmt, nesting) {
        let visitor = new CompositeConditionsVisitor(this._id, this._cfg, nesting);
        let decisionNode = visitor.visit(stmt, true);
        this._id = visitor._id;
        return decisionNode;
    }

    get cfg() {
        return this._cfg;
    }
}
module.exports = CFGVisitor;
