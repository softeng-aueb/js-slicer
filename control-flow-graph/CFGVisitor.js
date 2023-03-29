const FunctionObj = require("../code-parser-module/domain/FunctionObj");
const ConditionalStatement = require("../code-parser-module/domain/ConditionalStatement");
const {getNodeEdges, getConditionalStatementCFGNodes,getLoopStatementCFGNodes} = require("./helpers/cfgNodesHelpers")
const LoopStatement = require("../code-parser-module/domain/LoopStatement");
const CFGNode = require("./domain/CFGNode");
const CFG = require("./domain/CFG");
const ReturnStatement = require("../code-parser-module/domain/ReturnStatement");
const CFGEdge = require("./domain/CFGEdge");
const { cond } = require("lodash");

class CFGVisitor {

    constructor(){
        this._cfg = new CFG()
        this._id = 1;
        this._parentStack = [];
        this.nesting = 0
    }

    visitArrayExpression(stmt){
        this.visitBlockStatement(stmt.elements)
    }

    visitUpdateExpression(stmt){
        this.visitSequentialStatement(stmt)
    }

    visitBlockStatement(block, parent, condition){
        //this._parentStack.push(parent)
        this.nesting++
        for(let stmt of block){
            stmt.accept(this)
        }
        this.nesting--
    }

    visitLoopStatement(stmt){
        if (!stmt) return

        this.visitSequentialStatement(stmt.condition)
        let conditionNode = this._parentStack.slice(-1)[0]
        this.visitBlockStatement(stmt.body)
        // add loopback edges for contents of the parent stack
        for(let node of this._parentStack){
            this.addLoopBackEdge(node, conditionNode)
        }
        // actually do not clear it in all cases, filter and keep break nodes
        this._parentStack = []
        this._parentStack.push(conditionNode)
    }

    addLoopBackEdge(source, loopEntryNode){
        source.addOutgoingEdge(loopEntryNode, null)
    }

    visitConditionalStatement(stmt) {
        if (!stmt) return

        this.visitSequentialStatement(stmt.condition)
        let conditionNode = this._parentStack.slice(-1)[0]
        
        this.visitBlockStatement(stmt.then)
        
        if (stmt.alternates){
            let stack = [...this._parentStack]
            this._parentStack = []
            this._parentStack.push(conditionNode);
            if (stmt.alternates instanceof ConditionalStatement) {
                this.visitConditionalStatement(stmt.alternates)
            } else {
                this.visitBlockStatement(stmt.alternates)
            }
            this._parentStack.push(...stack)
        } else {
            this._parentStack.push(conditionNode);
        }
        
        
    }

    visitSequentialStatement(stmt){
        let node = new CFGNode(this._id++, null, stmt, [], null)
        node.nesting = this.nesting
        this.cfg.addNode(node)
        while(this._parentStack.length > 0){
            let parent = this._parentStack.pop()
            parent.addOutgoingEdge(node, null)
            node.addParent(parent)
        }
        this._parentStack.push(node);
    }

    visitFunctionCall(stmt){
        this.visitSequentialStatement(stmt)
    }

    visitAssignmentStatement(stmt){
        this.visitSequentialStatement(stmt)
    }

    visitVariableDeclaration(stmt){
        //console.log(stmt.value)
        stmt.value.accept(this)
        this.visitSequentialStatement(stmt)
    }

    visitBinaryExpression(stmt){
        //console.log(stmt.left)
        stmt.left.accept(this)
        stmt.right.accept(this)
    }

    visitUnaryExpression(stmt){
        stmt.argument.accept(this)
    }

    visitReturnStatement(stmt){
        this.visitSequentialStatement(stmt)
    }

    visitMemberExpression(stmt){
        stmt.property.accept(this)
        stmt.object.accept(this)
    }

    get cfg(){
        return this._cfg
    }


}
module.exports = CFGVisitor;