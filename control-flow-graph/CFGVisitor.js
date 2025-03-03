const ConditionalStatement = require("../code-parser-module/domain/ConditionalStatement");
const CFGNode = require("./domain/CFGNode");
const LoopEntryNode = require("./domain/LoopEntryNode");
const CFG = require("./domain/CFG");
const Stack = require("../utils/Stack");
const LogicalExpressionVisitor = require("./LogicalExpressionVisitor");
const CFGVisualizer = require("./CFGVisualizer");

class CFGVisitor {
    constructor() {
        this._cfg = new CFG();
        this._id = 1;
        this._parentStack = new Stack();
        this._loopEntryStack = new Stack();
        this.nesting = 0;
        this._visualizer = new CFGVisualizer();
        this._returnExitStack = [];
    }

    visitArrayExpression(stmt) {
        this.visitBlockStatement(stmt.elements);
    }

    visitUpdateExpression(stmt) {
        this.visitSequentialStatement(stmt);
    }

    visitBlockStatement(block, parent, condition) {
        this.nesting++;
        for (let stmt of block) {
            stmt.accept(this);
        }
        this.nesting--;
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

        this.visitSequentialStatement(stmt.condition, true);
        let loopEntryNode = this._parentStack.peek();
        this._loopEntryStack.push(loopEntryNode);

        this.visitBlockStatement(stmt.body);
        // add loopback edges for contents of the parent stack
        for (let node of this._parentStack.elements) {
            this.addLoopBackEdge(node, loopEntryNode);
        }

        // next node will have incoming edges from loopEntry and break nodes
        this._parentStack.clear();
        this._parentStack.push(loopEntryNode);
        this._parentStack.pushList(loopEntryNode.breakNodes);
        // remove node from stack on block exit
        this._loopEntryStack.pop();
    }

    addLoopBackEdge(source, loopEntryNode) {
        source.addOutgoingEdge(loopEntryNode, null);
    }

    visitConditionalStatement(stmt) {
        if (!stmt) return;

        let condition = stmt.condition;
        let then = stmt.then;
        let alternates = stmt.alternates;

        this._visualizer.exportCFGToDot(this._cfg, "VisitorTest1");

        if (condition) {
            this._id = this.visitLogicalExpression(condition, this._parentStack);
        }
        this._visualizer.exportCFGToDot(this._cfg, "VisitorTest2");

        // True and False nodes created by the logical expression visitor
        let conditionTrueNode = this._parentStack.pop();
        let conditionFalseNode = this._parentStack.pop();

        this._parentStack.clear();
        this._parentStack.push(conditionTrueNode);
        if (then instanceof ConditionalStatement) {
            this.visitConditionalStatement(then);
        } else {
            this.visitBlockStatement(then);
        }
        this._visualizer.exportCFGToDot(this._cfg, "VisitorTest3");

        if (alternates) {
            let stackBackup = [...this._parentStack.elements];
            this._parentStack.clear();
            this._parentStack.push(conditionFalseNode);
            if (stmt.alternates instanceof ConditionalStatement) {
                this.visitConditionalStatement(stmt.alternates);
            } else {
                this.visitBlockStatement(stmt.alternates);
            }
            this._parentStack.pushList(stackBackup);
        } else {
            this._parentStack.push(conditionFalseNode);
        }
        this._visualizer.exportCFGToDot(this._cfg, "VisitorTest4");
    }

    visitSequentialStatement(stmt, isLoopEntry = false) {
        let node = null;
        if (isLoopEntry) {
            node = new LoopEntryNode(this._id++, null, stmt, [], null);
        } else {
            node = new CFGNode(this._id++, null, stmt, [], null);
        }

        node.nesting = this.nesting;
        this.cfg.addNode(node);
        while (this._parentStack.length > 0) {
            let parent = this._parentStack.pop();
            parent.addOutgoingEdge(node, null);
            node.addParent(parent);
        }
        this._parentStack.push(node);
    }

    visitFunctionCall(stmt) {
        this.visitSequentialStatement(stmt);
    }

    visitAssignmentStatement(stmt) {
        this.visitSequentialStatement(stmt);
    }

    visitVariableDeclaration(stmt) {
        //console.log(stmt.value)
        stmt.value.accept(this);
        this.visitSequentialStatement(stmt);
    }

    visitBinaryExpression(stmt) {
        //console.log(stmt.left)
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
        // should not have incoming edges from subsequent edges within the loop
        let breakNode = this._parentStack.pop();
        // add node to break statement to closest loop entry node
        // FIXME: check label to find the appropriate loop
        let loopEntry = this._loopEntryStack.peek();
        if (loopEntry) {
            loopEntry.addBreakNode(breakNode);
        }
    }

    visitMemberExpression(stmt) {
        stmt.property.accept(this);
        stmt.object.accept(this);
    }

    visitLogicalExpression(stmt, parentStack) {
        let LogicalExprVisitor = new LogicalExpressionVisitor(this._id, this._cfg);
        return LogicalExprVisitor.visit(stmt, parentStack);
    }

    get cfg() {
        return this._cfg;
    }
}
module.exports = CFGVisitor;
