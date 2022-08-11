class DDGEdge {
    constructor(source, target, dependantVariable) {
        this._source = source;
        this._target = target;
        this._dependantVariable = dependantVariable;
    }

    get dependantVariable() {
        return this._dependantVariable;
    }

    set dependantVariable(value) {
        this._dependantVariable = value;
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

module.exports = DDGEdge;