const ConditionalStatement = require("../code-parser-module/domain/ConditionalStatement");
const CFGNode = require("./domain/CFGNode");
const LoopEntryNode = require("./domain/LoopEntryNode");
const CFG = require("./domain/CFG");
const Stack = require("../utils/Stack");
const CompositeConditionsVisitor = require("./CompositeConditionsVisitor");
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
        this._tempRemovedNodes = [];
    }

    // Implements connection algorithm logic
    connectNodeToCFG(node) {
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
        let printStr = "";
        this._parentStack.elements.forEach((it) => {
            printStr = printStr.concat(`${it.id} `);
        });
        console.log("Parent stack content: " + printStr);
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
        // Reinsert nodes temporarily removed
        while (this._tempRemovedNodes.length > 0) {
            this._parentStack.push(this._tempRemovedNodes.shift());
        }

        // Temporarily remove nodes with nesting equal to current nesting
        for (const n of this._parentStack._elements) {
            if (n.nesting == this.nesting) {
                let elements = this._parentStack._elements;
                let indexToRemove = elements.findIndex((node) => node.id === n.id);
                this._tempRemovedNodes.push(elements.splice(indexToRemove, 1));
            }
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

        /**
         *
         * TODO: Ensure loop logic works with conditional statement new approach
         *
         */

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

        let decisionNode;

        if (condition) {
            decisionNode = this.visitLogicalExpression(condition, this._parentStack);
            this.connectNodeToCFG(decisionNode);
        }

        if (then instanceof ConditionalStatement) {
            this.visitConditionalStatement(then);
        } else {
            this.visitBlockStatement(then);
        }

        if (alternates instanceof ConditionalStatement) {
            this.visitConditionalStatement(alternates);
        } else {
            this.visitBlockStatement(alternates);
        }
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
        this.connectNodeToCFG(node);
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
