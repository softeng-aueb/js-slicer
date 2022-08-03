class FDTEdge {
    constructor(source, target, condition) {
        this._source = source;
        this._target = target;
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

module.exports = FDTEdge;