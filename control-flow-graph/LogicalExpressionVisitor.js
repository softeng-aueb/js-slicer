
const ConditionalStatement = require("../code-parser-module/domain/ConditionalStatement");
const CFGNode = require("./domain/CFGNode");
const LoopEntryNode = require("./domain/LoopEntryNode");
const CFG = require("./domain/CFG");
const Stack = require("../utils/Stack");

class LogicalExpressionVisitor {

    constructor() {
        this._nodes = []
        this._thenPlaceHolderNode = new CFGNode(-1, null, null, [], null)
        this._elsePlaceHolderNode = new CFGNode(-2, null, null, [], null)
        this._id = 0;
        this._parentStack = new Stack()
    }

    get nodes() {
        return this._nodes
    }

    visitArrayExpression(stmt) {
        this.visitBlockStatement(stmt.elements)
    }

    visitUpdateExpression(stmt) {
        this.visitSequentialStatement(stmt)
    }

    shortCircuitControlFlow(lhsNode, rhsNode, andOperator,
        thenExitNode, elseExitNode) {
        
        if (andOperator) {
            lhsNode.addOutgoingEdge(rhsNode, 'True')
            lhsNode.addOutgoingEdge(elseExitNode, 'False')
            rhsNode.addOutgoingEdge(thenExitNode, 'True')
            rhsNode.addOutgoingEdge(elseExitNode, 'False')
        } else if (stmt.isOrExpression()) {
            lhsNode.addOutgoingEdge(rhsNode, 'False')
            lhsNode.addOutgoingEdge(thenExitNode, 'True')
            rhsNode.addOutgoingEdge(thenExitNode, 'True')
            rhsNode.addOutgoingEdge(elseExitNode, 'False')
        }
    }

    visitLogicalExpression(stmt) {
        
    }

    visitSequentialStatement(stmt, isLoopEntry = false) {

        let node = new CFGNode(this._id++, null, stmt, [], null)
        this._nodes.push(node)

        this.cfg.addNode(node)
        while (this._parentStack.length > 0) {
            let parent = this._parentStack.pop()
            parent.addOutgoingEdge(node, null)
            node.addParent(parent)
        }
        this._parentStack.push(node);
    }

    visitFunctionCall(stmt) {
        this.visitSequentialStatement(stmt)
    }

    visitAssignmentStatement(stmt) {
        this.visitSequentialStatement(stmt)
    }

    visitVariableDeclaration(stmt) {
        //console.log(stmt.value)
        stmt.value.accept(this)
        this.visitSequentialStatement(stmt)
    }

    visitBinaryExpression(stmt) {
        //console.log(stmt.left)
        stmt.left.accept(this)
        stmt.right.accept(this)
    }

    visitUnaryExpression(stmt) {
        stmt.argument.accept(this)
    }

    visitMemberExpression(stmt) {
        stmt.property.accept(this)
        stmt.object.accept(this)
    }
}
module.exports = LogicalExpressionVisitor;