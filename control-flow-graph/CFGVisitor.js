const ConditionalStatement = require("../code-parser-module/domain/ConditionalStatement");
const CFGNode = require("./domain/CFGNode");
const LoopEntryNode = require("./domain/LoopEntryNode");
const CFG = require("./domain/CFG");
const Stack = require("../utils/Stack");
const CompositeConditionsVisitor = require("./CompositeConditionsVisitor");
const CFGVisualizer = require("./CFGVisualizer");
const DecisionNode = require("./domain/DecisionNode");
const ExitNodeList = require("./domain/ExitNodeList");

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

        // This list holds the returned exit nodes from if statements and is used to create a ExitNodeList object that holds the nodes
        // and is pushed in the parent stack to be connected with the immediate next node then removed.
        let blockStatementExitNodes = null;

        for (let stmt of block) {
            blockStatementExitNodes = stmt.accept(this);

            if (blockStatementExitNodes) {
                // FIXME: the JoinNode instance has been created by the respective visitConditionalStatement
                // replace the following with:
                // this._parentStack.push(exitNodes)
                let nodelist = new ExitNodeList(blockStatementExitNodes);
                this._parentStack.push(nodelist);

                console.log(`Nodelist created: ${nodelist.getItemIds()}`);
            }
        }

        this.nesting--;

        let current = this._parentStack.pop();

        // If the top of the stack is a ExitNodeList (block statement ended with if statement) then
        // remove it and return the list of its nodes.


        // FIXME: is there a case that the current node is a DN node (I think not)
        // FIXME: in case that the currentNode is a return node then we should return nothing (e.g. null)
        // otherwise just return the current node (which could be plain node or JoinNode - for the time being)
        /*
            if (current instanceof Return){
                return null
            } else {
                return current
            }
        */

        // FIXME: the following should probably be replaced by the above code
        if (current instanceof ExitNodeList) {
            console.log(`Temporarily removed nodelist: ${current.getItemIds()}`);
            return current.getList();
        }
        // If the top of the stack is a DN, do not remove, there is never a correct state where a DN should be removed with this algorithm.
        // It may be removed on accident due to return nodes being removed on their own when visited.
        else if (current instanceof DecisionNode) {
            this._parentStack.push(current);
        }
        // If the top of the stack is a normal node, remove it and return it
        else if (current) {
            console.log(`Temporarily removed node: ${current.id}`);
            return [current];
        }
        return [];
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

        // FIXME: Check if continue and loop exit nodes could also be represented by JoinNode instance
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

        // FIXME: actually we need a JoinNode that will merge all exits of the conditional branches
        // let joinNode = new JoinNode()
        let IfStatementExitNodes = [];


        // FIXME: the next statements could be replace just by the two following polymorphic calls
        // joinNode.merge(then.accept(this))
        // joinNode.merge(alternates.accept(this))


        // FIXME: should be removed
        if (then instanceof ConditionalStatement) {
            IfStatementExitNodes.push(...this.visitConditionalStatement(then));
        } else {
            IfStatementExitNodes.push(...this.visitBlockStatement(then));
        }

        if (alternates instanceof ConditionalStatement) {
            IfStatementExitNodes.push(...this.visitConditionalStatement(alternates));
        } else {
            IfStatementExitNodes.push(...this.visitBlockStatement(alternates));
        }

        // //Debug
        // let printStr = "";
        // IfStatementExitNodes.forEach((it) => {
        //     printStr = printStr.concat(`${it.id} `);
        // });
        // console.log(`IF Statement ${decisionNode.id} ended with return list: ${printStr}`);

        // FIXME: return joinNode
        return IfStatementExitNodes;
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
