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
        this._parent = null;
    }

    visitAssignmentStatement(stmt){
        let node = new CFGNode(this._id++, null, stmt, [], null)
        this.cfg.addNode(node)
        if (this._parent){
            this._parent.addOutgoingEdge(node, null)
        }
        this._parent = node;
    }

    visitVariableDeclaration(stmt){
        let node = new CFGNode(this._id++, null, stmt, [], null)
        this.cfg.addNode(node)
        if (this._parent){
            this._parent.addOutgoingEdge(node, null)
        }
        this._parent = node;
    }

    get cfg(){
        return this._cfg
    }


}
module.exports = CFGVisitor;