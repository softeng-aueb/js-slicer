class ContinueStatement {
    constructor(label) {
        this._label = label;
    }

    get label() {
        return this._label;
    }

    set label(value) {
        this._label = value;
    }

    accept(visitor) {
        visitor.visitContinueStatement(this);
    }
}
module.exports = ContinueStatement;
