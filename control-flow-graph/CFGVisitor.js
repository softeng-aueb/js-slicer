const ConditionalStatement = require("../code-parser-module/domain/ConditionalStatement");
const CFGNode = require("./domain/CFGNode");
const LoopEntryNode = require("./domain/LoopEntryNode");
const CFG = require("./domain/CFG");
const Stack = require("../utils/Stack");
const CompositeConditionsVisitor = require("./CompositeConditionsVisitor");
const CFGVisualizer = require("./CFGVisualizer");
const DecisionNode = require("./domain/DecisionNode");
const JoinNode = require("./domain/JoinNode");
const BlockStatement = require("../code-parser-module/domain/BlockStatement");

class CFGVisitor {
    constructor() {
        this._cfg = new CFG();
        this._id = 1;
        this._parentStack = new Stack();
        this._loopEntryStack = new Stack();
        this.nesting = 0;
        this._visualizer = new CFGVisualizer();
        this._returnExitStack = [];
        this._tempRemovedNodes = [];
    }

    // Implements connection algorithm logic
    connectNodeToCFG(node) {
        //Debug
        let printStr2 = "";
        this._parentStack.elements.forEach((it) => {
            printStr2 = printStr2.concat(`${it.id} `);
        });

        console.log(`Starting Parent Stack: ${printStr2}`);

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
        let printStr1 = "";
        this._parentStack.elements.forEach((it) => {
            printStr1 = printStr1.concat(`${it.id} `);
        });

        console.log(`Parent Stack: ${printStr1}`);
    }

    visitArrayExpression(stmt) {
        this.visitBlockStatement(stmt.elements);
    }

    visitUpdateExpression(stmt) {
        this.visitSequentialStatement(stmt);
    }

    visitBlockStatement(block) {
        this.nesting++;
        let stmts = block instanceof BlockStatement ? block.stmts : block;
        // This variable holds the returned exit nodes from if statements and is used to create a JoinNode object that holds the nodes
        // and is pushed in the parent stack to be connected with the immediate next node then removed.
        let exitNodes = null;

        for (let stmt of stmts) {
            exitNodes = stmt.accept(this);

            if (exitNodes && exitNodes.list.length > 0) {
                this._parentStack.push(exitNodes);
            }
        }

        this.nesting--;

        let current = this._parentStack.pop();

        // If the top of the stack is a DN, do not remove, there is never a correct state where a DN should be removed with this algorithm.
        // It may be removed on accident due to return nodes being removed on their own when visited.
        if (current instanceof DecisionNode) {
            this._parentStack.push(current);
            return [];
        } else {
            return current;
        }
    }

    visitForStatement(stmt) {
        this.visitSequentialStatement(stmt.init);
        // add update expression as the last statement of the for body
        stmt.body.push(stmt.update);
        this.visitLoopStatement(stmt);
        stmt.body.pop();
    }

    visitLoopStatement(stmt) {
        if (!stmt) return;

        let conditionNode = this.visitConditionalStatement(stmt.condition);
        this.connectNodeToCFG(conditionNode);

        this.visitBlockStatement(stmt.body);
    }

    addLoopBackEdge(source, loopEntryNode) {
        source.addOutgoingEdge(loopEntryNode, null);
    }

    visitConditionalStatement(stmt) {
        if (!stmt) return;

        let condition = stmt.condition;
        let then = stmt.then;
        let alternates = stmt.alternates;

        let decisionNode;

        if (condition) {
            decisionNode = this.visitLogicalExpression(condition, this._parentStack);
            this.connectNodeToCFG(decisionNode);
        }

        let conditionalExitsJoinNode = new JoinNode();

        conditionalExitsJoinNode.merge(then.accept(this));
        conditionalExitsJoinNode.merge(alternates.accept(this));

        //Debug
        let printStr = "";
        conditionalExitsJoinNode.list.forEach((it) => {
            printStr = printStr.concat(`${it.id} `);
        });
        console.log(`IF Statement ${decisionNode.id} ended with return list: ${printStr}`);

        return conditionalExitsJoinNode;
    }

    visitSequentialStatement(stmt, isLoopEntry = false) {
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
        stmt.value.accept(this);
        this.visitSequentialStatement(stmt);
    }

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
    }

    visitMemberExpression(stmt) {
        stmt.property.accept(this);
        stmt.object.accept(this);
    }

    visitLogicalExpression(stmt, parentStack) {
        let visitor = new CompositeConditionsVisitor(this._id, this._cfg, parentStack.peek().nesting);
        let decisionNode = visitor.visit(stmt, true);
        this._id = visitor._id;
        return decisionNode;
    }

    get cfg() {
        return this._cfg;
    }
}
module.exports = CFGVisitor;
