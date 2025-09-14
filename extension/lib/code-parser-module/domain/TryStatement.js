class TryStatement {
    constructor(block, handler, finalizer) {
        this._block = block;
        this._handler = handler;
        this._finalizer = finalizer;
    }

    get block() {
        return this._block;
    }

    get handler() {
        return this._handler;
    }

    get finalizer() {
        return this._finalizer;
    }

    accept(visitor, returnFirstStatement = false) {
        return visitor.visitTryStatement(this, returnFirstStatement);
    }
}
module.exports = TryStatement;
