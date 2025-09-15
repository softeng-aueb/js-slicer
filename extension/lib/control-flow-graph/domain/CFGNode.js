const astObjectTypes = require("../../code-parser-module/constants/astObjectTypes");
const Identifier = require("../../code-parser-module/domain/Identifier");
const CFGEdge = require("./CFGEdge");

class CFGNode {
    constructor(id, executionCondition, statement, edges, parent) {
        this._id = id;
        this._executionCondition = executionCondition;
        this._statement = statement;
        this._edges = edges;
        this._parents = [];
        if (parent) this._parents.push(parent);
        this._nesting = 0;
        this._label = id;
    }

    get label() {
        return this._label;
    }

    set label(name) {
        this._label = name;
    }

    get nesting() {
        return this._nesting;
    }

    set nesting(value) {
        this._nesting = value;
    }

    addNextNode(node) {
        this.addOutgoingEdge(node.getRoot());
        node.getRoot().addParent(this);
    }

    hasDanglingEdges() {
        return false;
    }

    getRoot() {
        return this;
    }

    hasStatementType(typeStr) {
        return this.statement.constructor.name === typeStr;
    }

    isJumpNode() {
        let jumpNodeTypes = [
            astObjectTypes.BREAK_STATEMENT,
            astObjectTypes.CONTINUE_STATEMENT,
            astObjectTypes.LOGICAL_EXPRESSION,
            astObjectTypes.RETURN_STATEMENT,
            astObjectTypes.THROW_STATEMENT,
        ];
        if (!this.statement) return false;
        return (
            this._edges.length >= 2 ||
            jumpNodeTypes.includes(this.statement.constructor.name) ||
            (this.statement instanceof Identifier && this.statement._uniqueText) /* Specific condition for switch statement discriminants */
        );
    }

    hasEdgeTo(targetNodeId) {
        let result = this.edges.filter((e) => e.target === targetNodeId);
        if (result && result.length > 0) {
            return true;
        }
        return false;
    }

    nextNodes(visited) {
        let result = [];
        for (let e of this._edges) {
            if (!visited.includes(e.targetNode) && !result.includes(e.targetNode)) result.push(e.targetNode);
        }
        return result.sort((a, b) => -(a.id - b.id));
    }

    addOutgoingEdge(targetNode, condition) {
        if (this._edges.find((edge) => edge.sourceNode === this && edge.targetNode === targetNode)) return;
        //console.log(`Adding edge from ${this._id} to ${targetNode.id} with condition: ${condition}`);
        let edge = new CFGEdge(this.id, targetNode.id, condition, this, targetNode);
        this.edges.push(edge);
        targetNode.addParent(this);
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
