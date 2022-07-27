class CFGNode {

    constructor(id,executionCondition,statement,edges) {
        this._id = id;
        this._executionCondition = executionCondition
        this._statement = statement;
        this._edges = edges;
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

    isConditionalNode () {
        return Array.isArray(this._edges) && this._edges.length > 1;
    }

    isDependantNode (cfg) {
        return cfg.find(node => Array.isArray(node._edges) && node._edges.find(edge => edge._condition === true && edge._target === this._id));
    }
}
module.exports = CFGNode;