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
        let printStr1 = "";
        this._parentStack.elements.forEach((it) => {
            printStr1 = printStr1.concat(`${it.id} `);
        });

        let printStr2 = "";
        this._tempRemovedNodes.forEach((it) => {
            printStr2 = printStr2.concat(`${it.id} `);
        });

        console.log(`Parent Stack: ${printStr1} | Backup: ${printStr2}`);
    }

    handleTemporaryRemovedNodes() {
        // Called on block statement end
        // Remove nodes with nesting greater than or equal to visitor's nesting and add them to a special list

        //Debug
        let printStr = "";

        for (const n of this._parentStack._elements) {
            if (n.nesting >= this.nesting) {
                let elements = this._parentStack._elements;
                let indexToRemove = elements.findIndex((node) => node.id === n.id);
                let removedNode = elements.splice(indexToRemove, 1)[0];
                this._tempRemovedNodes.push(removedNode);

                printStr = printStr.concat(`${removedNode.id} `);
            }
        }

        console.log("Nodes Temp Removed: " + printStr);
    }

    handleTemporaryRecoveredNodes() {
        // Called on block statement end
        // Recover nodes with nesting greater than visitor's nesting and connect them with stack's top

        //Debug
        let printStr = "";
        for (const tn of this._tempRemovedNodes) {
            if (tn.nesting > this.nesting) {
                let indexToRemove = this._tempRemovedNodes.findIndex((node) => node.id === tn.id);
                let recoveredNode = this._tempRemovedNodes.splice(indexToRemove, 1)[0];
                recoveredNode.addNextNode(this._parentStack.peek());

                printStr = printStr.concat(`${recoveredNode.id} `);
            }
        }

        console.log("Nodes Recovered: " + printStr);
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
        this.handleTemporaryRemovedNodes();
        this.handleTemporaryRecoveredNodes();
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

        this.visitConditionalStatement(stmt.condition);
        let loopEntryNode = this._parentStack.peek(); //this is now a decision node
        this._loopEntryStack.push(loopEntryNode);

        this.visitBlockStatement(stmt.body);

        // add loopback edges for contents of the parent stack

        // for (let node of this._parentStack.elements) {
        //     this.addLoopBackEdge(node, loopEntryNode);
        // }

        /**
         *
         * TODO: Ensure loop logic works with conditional statement new approach
         *
         */

        // next node will have incoming edges from loopEntry and break nodes

        // this._parentStack.clear();
        // this._parentStack.push(loopEntryNode);
        // this._parentStack.pushList(loopEntryNode.breakNodes);
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
        node = new CFGNode(this._id++, null, stmt, [], null);

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
