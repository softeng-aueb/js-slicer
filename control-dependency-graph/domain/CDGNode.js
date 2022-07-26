class CDGNode{
    constructor(nodeId, statement, edges) {
        this._nodeId = nodeId;
        this._statement = statement;
        this._edges = edges;
    }


    get nodeId() {
        return this._nodeId;
    }

    set nodeId(value) {
        this._nodeId = value;
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
}

module.exports = CDGNode;