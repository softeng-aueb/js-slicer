const astObjectTypes = require("../../code-parser-module/constants/astObjectTypes");
const CFGEdge = require("./CFGEdge");

class CFGNode {
    constructor(id, executionCondition, statement, edges, parent) {
        this._id = id;
        this._executionCondition = executionCondition;
        this._statement = statement;
        this._edges = edges;
        this._parents = [];
        this._parents.push(parent);
        this._nesting = 0;
        this._breakNodes = [];
        //this._branchNode = false
    }

    get nesting() {
        return this._nesting;
    }

    set nesting(value) {
        this._nesting = value;
    }

    isBreakStatement() {
        return this._statement.type === astObjectTypes.BREAK_STATEMENT;
    }

    isReturnStatement() {
        return this._edges.length == 0;
    }

    hasStatementType(typeStr) {
        return this.statement.constructor.name === typeStr;
    }

    hasEdgeTo(targetNodeId) {
        let result = this.edges.filter((e) => e.target === targetNodeId);
        if (result && result.length > 0) {
            return true;
        }
        return false;
    }

    addOutgoingEdge(targetNode, condition) {
        //console.log(`Adding edge from ${this._id} to ${targetNode.id} with condition: ${condition}`);
        let edge = new CFGEdge(this.id, targetNode.id, condition, this, targetNode);
        this.edges.push(edge);
    }

    get parents() {
        return this._parents;
    }

    set parents(value) {
        this._parents = value;
    }

    addParent(parent) {
        this._parents.push(parent);
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get executionCondition() {
        return this._executionCondition;
    }

    set executionCondition(value) {
        this._executionCondition = value;
    }

    get statement() {
        return this._statement;
    }

    set statement(value) {
        this._statement = value;
    }

    get edges() {
        return this._edges;
    }

    set edges(value) {
        this._edges = value;
    }

    isDependantNode(cfg) {
        return cfg.find((node) => node._edges.find((edge) => edge._condition === true && edge._target === this._id));
    }

    isExitNode() {
        return this._edges.length === 0;
    }

    dominatesNode(paths, node) {
        if (this._id === node._id) {
            return true;
        }
        if (this._id !== node._id && paths.every((path) => path.includes(this._id))) {
            return true;
        }
        return false;
    }
}
module.exports = CFGNode;
