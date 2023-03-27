const FunctionObj = require("../code-parser-module/domain/FunctionObj");
const ConditionalStatement = require("../code-parser-module/domain/ConditionalStatement");
const {getNodeEdges, getConditionalStatementCFGNodes,getLoopStatementCFGNodes} = require("./helpers/cfgNodesHelpers")
const LoopStatement = require("../code-parser-module/domain/LoopStatement");
const CFGNode = require("./domain/CFGNode");
const CFG = require("./domain/CFG");
const ReturnStatement = require("../code-parser-module/domain/ReturnStatement");
const CFGEdge = require("./domain/CFGEdge");

class CFGVisitor {

    constructor(){
        this._cfg = new CFG()
        this._id = 1;
        this._parentStack = [];
    }

    visitArrayExpression(stmt){
        this.visitBlockStatement(stmt.elements)
    }

    visitUpdateExpression(stmt){
        this.visitSequentialStatement(stmt)
    }

    visitBlockStatement(block, parent, condition){
        //this._parentStack.push(parent)
        for(let stmt of block){
        //console.log(stmt.constructor.name)
            stmt.accept(this)
        }
    }

    visitConditionalStatement(stmt){
        let node = new CFGNode(this._id++, null, stmt, [], null)
        this.cfg.addNode(node)
        if (this._parentStack.length > 0){
            let parent = this._parentStack.pop()
            parent.addOutgoingEdge(node, null)
            this._parentStack.push(node);
            console.log(stmt)
            this.visitBlockStatement(stmt.then, parent, true)
            this._parentStack.push(node);
            // etc
        }
    }

    visitSequentialStatement(stmt){
        let node = new CFGNode(this._id++, null, stmt, [], null)
        this.cfg.addNode(node)
        if (this._parentStack.length > 0){
            let parent = this._parentStack.pop()
            parent.addOutgoingEdge(node, null)
            node.parent =  parent
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
        stmt.value.accept(this)
        this.visitSequentialStatement(stmt)
    }

    visitReturnStatement(stmt){
        this.visitSequentialStatement(stmt)
    }

    get cfg(){
        return this._cfg
    }


}
module.exports = CFGVisitor;