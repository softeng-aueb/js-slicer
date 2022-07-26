class CFGEdge {
    constructor(source, target, condition) {
        this._source = source;
        this._target = target;
        this._condition = condition;
    }

    get condition() {
        return this._condition;
    }

    set condition(value) {
        this._condition = value;
    }

    get source() {
        return this._source;
    }

    set source(value) {
        this._source = value;
    }

    get target() {
        return this._target;
    }

    set target(value) {
        this._target = value;
    }
}

module.exports = CFGEdge;