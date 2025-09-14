class CFGEdge {
    constructor(source, target, condition, sourceNode, targetNode) {
        this._sourceId = sourceNode.id;
        this._targetId = targetNode.id;
        this._condition = condition;
        this._sourceNode = sourceNode;
        this._targetNode = targetNode;
    }

    get sourceNode() {
        return this._sourceNode;
    }

    get targetNode() {
        return this._targetNode;
    }

    get condition() {
        return this._condition;
    }

    set condition(value) {
        this._condition = value;
    }

    get source() {
        return this._sourceNode.id;
    }

    set source(value) {
        this._sourceId = value;
    }

    get target() {
        return this._targetNode.id;
    }

    set target(value) {
        this._targetId = value;
    }
}

module.exports = CFGEdge;
