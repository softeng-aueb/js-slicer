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
const SwitchStatement = require("../code-parser-module/domain/SwitchStatement");
const ThrowStatement = require("../code-parser-module/domain/ThrowStatement");

class CFGVisitor {
    constructor(debug = false) {
        this._cfg = new CFG();
        this._id = 1;
        this._parentStack = new Stack();
        this.nesting = 0;
        this._visualizer = new CFGVisualizer();
        this._returnExitStack = [];
        this._breakAndContinueNodeRecords = [];
        this._throwAndReturnNodeRecords = [];
        this._complexStatementsFirstNodes = [];
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
        let exitNodes = null;

        let stmts = block._stmts;

        for (let stmt of stmts) {
            if (
                stmt instanceof ReturnStatement ||
                stmt instanceof BreakStatement ||
                stmt instanceof ContinueStatement ||
                stmt instanceof ThrowStatement
            ) {
                stmt.accept(this);
                this.nesting--;
                return null;
            }

            exitNodes = stmt.accept(this);

            if (exitNodes) {
                if (exitNodes.list.length === 0) return null;
                this._parentStack.push(exitNodes);
            }
        }

        this.nesting--;

        let result = stmts.length > 0 ? this._parentStack.pop() : null;
        return result;
    }

    visitForEachStatement(stmt, returnFirstStatement = false) {
        return this.visitLoopStatement(stmt, false, returnFirstStatement);
    }

    visitDoWhileStatement(stmt, returnFirstStatement = false) {
        // Create a record for all break/continue nodes related to this loop only
        let currentLoopJumpNodes = {};

        currentLoopJumpNodes.breaks = [];
        currentLoopJumpNodes.continues = [];

        this._breakAndContinueNodeRecords.push(currentLoopJumpNodes);

        // Special handling for first expression needed in order to obtain a valid loopback target for the condition
        let firstBlockNode = null;
        let first = stmt.body.stmts.splice(0, 1)[0];
        if (first instanceof ConditionalStatement || first instanceof LoopStatement || first instanceof SwitchStatement) {
            let exitNodes = first.accept(this, true);
            firstBlockNode = this._complexStatementsFirstNodes.pop();

            if (exitNodes) {
                this._parentStack.push(exitNodes);
            }
        } else {
            first.accept(this);
            firstBlockNode = this._parentStack.peek();
        }

        if (returnFirstStatement) {
            this._complexStatementsFirstNodes.push(firstBlockNode);
        }
        let loopBackNode = this.visitBlockStatement(stmt.body);
        // Loopback node is null only when the dowhile block has one statement.
        // In that case, the loopback node will be found in the parent stack.
        if (!loopBackNode) {
            loopBackNode = this._parentStack.pop();
        }

        // In Do...While the condition must be parsed last
        let conditionNode = this.visitLogicalExpression(stmt.condition, this.nesting);

        currentLoopJumpNodes = this._breakAndContinueNodeRecords.pop();

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
        loopBackNode?.addNextNode(conditionNode);

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

    visitWhileStatement(stmt, returnFirstStatement = false) {
        return this.visitLoopStatement(stmt, false, returnFirstStatement);
    }

    visitForStatement(stmt, returnFirstStatement = false) {
        this.visitSequentialStatement(stmt.init);

        // If called as the first expression of do..while push the init node.
        if (returnFirstStatement) {
            this._complexStatementsFirstNodes.push(this._parentStack.peek());
        }

        // add update expression as the last statement of the for body
        stmt.body.stmts.push(stmt.update);
        let loopJoinExitNode = this.visitLoopStatement(stmt, true);
        stmt.body.stmts.pop();

        return loopJoinExitNode;
    }

    visitLoopStatement(stmt, hasUpdateExpression = false, returnFirstStatement = false) {
        if (!stmt) return;

        let conditionNode = this.visitLogicalExpression(stmt.condition, this.nesting);
        this.connectNodeToCFG(conditionNode);

        // Create a record for all break/continue nodes related to this loop only
        let currentLoopJumpNodes = {};

        currentLoopJumpNodes.breaks = [];
        currentLoopJumpNodes.continues = [];

        this._breakAndContinueNodeRecords.push(currentLoopJumpNodes);

        let loopBackNode = this.visitBlockStatement(stmt.body);

        let loopJoinExitNode = new JoinNode();

        currentLoopJumpNodes = this._breakAndContinueNodeRecords.pop();

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
        loopBackNode?.addNextNode(conditionNode);

        // Push the correct node for do while if this loop is
        // a first expression of the block and is a while loop.
        // Case of For loops handled seperately in their own call.
        if (returnFirstStatement) {
            if (!hasUpdateExpression) {
                this._complexStatementsFirstNodes.push(conditionNode);
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

    visitConditionalStatement(stmt, returnFirstStatement = false) {
        if (!stmt) return;

        let condition = stmt.condition;
        let then = stmt.then;
        let alternates = stmt.alternates;

        let decisionNode;

        if (condition) {
            decisionNode = this.visitLogicalExpression(condition, this.nesting);
            this.connectNodeToCFG(decisionNode);

            if (returnFirstStatement) this._complexStatementsFirstNodes.push(decisionNode);
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

    // add error throws for invalid or not expected inputs for better UX (aka non identifier discriminant)
    visitSwitchStatement(stmt, returnFirstStatement = false) {
        this.visitSequentialStatement(stmt.discriminant);
        let discriminant = this._parentStack.pop();
        if (returnFirstStatement) {
            this._complexStatementsFirstNodes.push(discriminant);
        }

        let currentBreakNodes = { breaks: [] };
        this._breakAndContinueNodeRecords.push(currentBreakNodes);

        let switchExitNode = new JoinNode();

        let hangingJoinNode = new JoinNode(); // collection of nodes that have not finished their outbound edges
        let hangingConditions = [];

        for (let c of stmt.cases) {
            visitSwitchCase(c, this);
        }

        currentBreakNodes = this._breakAndContinueNodeRecords.pop();
        let breakJoinNode = new JoinNode();
        breakJoinNode.merge([...currentBreakNodes.breaks]);

        switchExitNode.merge(breakJoinNode);
        switchExitNode.merge(hangingJoinNode);
        return switchExitNode;

        function visitSwitchCase(caseStmt, visitor) {
            let caseBody = caseStmt.consequent; //BlockStatement
            if (caseBody?.stmts.length > 0) {
                visitor._parentStack.push(hangingJoinNode);

                let firstStatement = caseBody.stmts.splice(0, 1)[0];
                let firstBlockNode;
                let firstBlockNodeExitNodes;

                if (
                    firstStatement instanceof ConditionalStatement ||
                    firstStatement instanceof LoopStatement ||
                    firstStatement instanceof SwitchStatement
                ) {
                    firstBlockNodeExitNodes = firstStatement.accept(visitor, true);
                    firstBlockNode = visitor._complexStatementsFirstNodes.pop();

                    if (firstBlockNodeExitNodes) {
                        visitor._parentStack.push(firstBlockNodeExitNodes);
                    }
                } else if (
                    firstStatement instanceof ReturnStatement ||
                    firstStatement instanceof BreakStatement ||
                    firstStatement instanceof ContinueStatement ||
                    firstStatement instanceof ThrowStatement
                ) {
                    visitor.visitSequentialStatement(firstStatement);
                    firstBlockNode = visitor._parentStack.pop();

                    if (firstStatement instanceof ReturnStatement) {
                        visitor.logReturnNode(firstBlockNode);
                    } else if (firstStatement instanceof ThrowStatement) {
                        visitor.logThrowNode(firstBlockNode);
                    } else if (firstStatement instanceof ContinueStatement) {
                        // add to nearest loop log
                        let index = visitor._breakAndContinueNodeRecords.length - 1;
                        while (index >= 0) {
                            visitor._breakAndContinueNodeRecords[index].continues?.push(firstBlockNode);
                            index--;
                        }
                    } else switchExitNode.merge(firstBlockNode);
                } else {
                    firstStatement.accept(visitor);
                    firstBlockNode = visitor._parentStack.peek();
                }

                for (let cond of hangingConditions) {
                    discriminant.addOutgoingEdge(firstBlockNode, cond?.asText() ?? "default");
                }

                discriminant.addOutgoingEdge(firstBlockNode, caseStmt.test?.asText() ?? "default");
                hangingConditions = [];

                if (caseBody.stmts.length > 0) {
                    let caseBodyVisitResult = visitor.visitBlockStatement(caseBody);
                    hangingJoinNode.list = [];
                    hangingJoinNode.merge(caseBodyVisitResult);
                } else {
                    hangingJoinNode.list = [];
                    hangingJoinNode.merge(
                        firstBlockNodeExitNodes ??
                            (firstStatement instanceof ReturnStatement ||
                            firstStatement instanceof BreakStatement ||
                            firstStatement instanceof ContinueStatement ||
                            firstStatement instanceof ThrowStatement
                                ? null
                                : firstBlockNode)
                    );
                }
            } else {
                hangingConditions.push(caseStmt.test);
            }
        }
    }

    // try statements are not fully supported yet
    visitTryStatement(stmt, returnFirstStatement = false) {
        if (stmt.block.stmts.length === 0) throw new Error("Empty try block is not supported.");
        if (stmt.handler?.body.stmts.length === 0) throw new Error("Empty catch block is not supported.");
        if (stmt.finalizer?.stmts.length === 0) throw new Error("Empty finally block is not supported.");

        const tryBlock = parseTryCatchFinallyBlock(this, stmt.block);
        const catchBlock = parseTryCatchFinallyBlock(this, stmt.handler?.body);
        const finallyBlock = parseTryCatchFinallyBlock(this, stmt.finalizer);

        const exitNodes = new JoinNode();

        if (catchBlock) {
            // try throws to catch
            for (const throwNode of tryBlock.throwReturns.throws) {
                throwNode.addOutgoingEdge(catchBlock.first);
            }

            if (finallyBlock) {
                // try returns to finally
                for (const returnNode of tryBlock.throwReturns.returns) {
                    returnNode.addOutgoingEdge(finallyBlock.first);
                }

                //try exit to finally
                tryBlock.exit?.addNextNode(finallyBlock.first);

                // catch returns to finally
                for (const returnNode of catchBlock.throwReturns.returns) {
                    returnNode.addOutgoingEdge(finallyBlock.first);
                }

                // catch throws to finally
                for (const throwNode of catchBlock.throwReturns.throws) {
                    throwNode.addOutgoingEdge(catchBlock.first);
                }

                // catch exit to finally
                catchBlock.exit?.addNextNode(finallyBlock.first);

                // finally throws to exit
                for (const throwNode of finallyBlock.throwReturns.throws) {
                    this._returnExitStack.push(throwNode);
                }

                // finally returns to exit
                for (const returnNode of finallyBlock.throwReturns.returns) {
                    this._returnExitStack.push(returnNode);
                }

                // if catch or try had throw/return, exitNodes from finally must exit
                if (
                    tryBlock.throwReturns.throws.length > 0 ||
                    tryBlock.throwReturns.returns.length > 0 ||
                    catchBlock.throwReturns.throws.length > 0 ||
                    catchBlock.throwReturns.returns.length > 0
                ) {
                    for (const exitNode of finallyBlock.exit.list) {
                        exitNode.hasError = true;
                        this._returnExitStack.push(exitNode);
                    }
                }
                exitNodes.merge(finallyBlock.exit);
            } else {
                // try returns to exit
                for (const returnNode of tryBlock.throwReturns.returns) {
                    this._returnExitStack.push(returnNode);
                }

                //try exit to exitNodes
                exitNodes.merge(tryBlock.exit);

                // catch throws to exit
                for (const throwNode of catchBlock.throwReturns.throws) {
                    this._returnExitStack.push(throwNode);
                }

                // catch returns to exit
                for (const returnNode of catchBlock.throwReturns.returns) {
                    this._returnExitStack.push(returnNode);
                }

                //catch exit to exitNodes
                exitNodes.merge(catchBlock.exit);
            }
        } else {
            // try exit to exitNodes
            exitNodes.merge(tryBlock.exit);

            // try returns to exit
            for (const returnNode of tryBlock.throwReturns.returns) {
                this._returnExitStack.push(returnNode);
            }

            // try throws to exit
            for (const throwNode of tryBlock.throwReturns.throws) {
                this._returnExitStack.push(throwNode);
            }
        }

        return exitNodes;

        function parseTryCatchFinallyBlock(visitor, body) {
            if (!body) return null;
            visitor._throwAndReturnNodeRecords.push({ returns: [], throws: [] });

            let firstNode;
            let exitNodes;
            let throwReturns;
            let skipBlock = false;
            let firstStatement = body.stmts.splice(0, 1)[0];
            if (
                firstStatement instanceof ConditionalStatement ||
                firstStatement instanceof LoopStatement ||
                firstStatement instanceof SwitchStatement
            ) {
                exitNodes = firstStatement.accept(visitor, true);
                firstNode = visitor._complexStatementsFirstNodes.pop();
            } else {
                firstNode = new CFGNode(visitor._id++, null, firstStatement, [], null);
                firstNode.nesting = visitor.nesting;
                visitor.cfg.addNode(firstNode);

                if (firstStatement instanceof ReturnStatement) {
                    visitor.logReturnNode(firstNode);
                    skipBlock = true;
                } else if (firstStatement instanceof ThrowStatement) {
                    visitor.logThrowNode(firstNode);
                    skipBlock = true;
                } //TODO: If needed check edge case for loop/switch with try as first and first node is continue/break (not logged atm) need special handling
            }

            if (body.stmts.length > 0 && skipBlock === false) visitor._parentStack.push(exitNodes ?? firstNode);

            exitNodes =
                body.stmts.length > 0 && skipBlock == false
                    ? visitor.visitBlockStatement(body)
                    : exitNodes
                    ? exitNodes
                    : firstStatement instanceof ReturnStatement || firstStatement instanceof ThrowStatement
                    ? null
                    : new JoinNode(firstNode);

            throwReturns = visitor._throwAndReturnNodeRecords.pop();

            return { first: firstNode, exit: exitNodes, throwReturns: throwReturns };
        }
    }

    visitFunctionDeclaration(stmt) {
        this.visitSequentialStatement(stmt);
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
        this.visitSequentialStatement(stmt);
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
        let node = this._parentStack.pop();

        this.logReturnNode(node);
    }

    logReturnNode(node) {
        let returnLog = this._throwAndReturnNodeRecords.pop();
        // return log not null -> inside try block, keep track of node for connections
        if (returnLog) {
            returnLog.returns.push(node);
            this._throwAndReturnNodeRecords.push(returnLog);
        }
        // return log is null -> not inside try block, connect with exit
        else {
            this._returnExitStack.push(node);
        }
    }

    visitBreakStatement(stmt) {
        this.visitSequentialStatement(stmt);
        // subsequent nodes should not have incoming edges from this node
        let thisNode = this._parentStack.pop();

        //add itself to most recent loop's break nodes record
        let currentLoopRecord = this._breakAndContinueNodeRecords.pop();
        currentLoopRecord.breaks.push(thisNode);
        this._breakAndContinueNodeRecords.push(currentLoopRecord);
    }

    visitContinueStatement(stmt) {
        this.visitSequentialStatement(stmt);
        // subsequent nodes should not have incoming edges from this node
        let thisNode = this._parentStack.pop();

        //add itself to most recent loop's continue nodes record
        let currentLoopRecord = this._breakAndContinueNodeRecords.pop();
        currentLoopRecord.continues.push(thisNode);
        this._breakAndContinueNodeRecords.push(currentLoopRecord);
    }

    visitMemberExpression(stmt) {
        stmt.property.accept(this);
        stmt.object.accept(this);
    }

    visitThrowStatement(stmt) {
        this.visitSequentialStatement(stmt);
        let node = this._parentStack.pop(); // subsequent nodes should not have incoming edges from this node

        this.logThrowNode(node);
    }

    logThrowNode(node) {
        let throwLog = this._throwAndReturnNodeRecords.pop();
        // throw log not null -> inside try block, keep track of node for connections
        if (throwLog) {
            throwLog.throws.push(node);
            this._throwAndReturnNodeRecords.push(throwLog);
        }
        // throw log is null -> not inside try block, connect with exit
        else {
            this._returnExitStack.push(node);
        }
    }

    visitNewExpression(stmt) {
        this.visitSequentialStatement(stmt);
    }

    visitAwaitExpression(stmt) {
        this.visitSequentialStatement(stmt);
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
