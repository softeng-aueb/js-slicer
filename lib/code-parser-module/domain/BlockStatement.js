class BlockStatement {
    constructor(stmts) {
        this._stmts = stmts;
    }

    get stmts() {
        return this._stmts;
    }

    set stmts(stmts) {
        this._stmts = stmts;
    }

    accept(visitor) {
        return visitor.visitBlockStatement(this);
    }
}
module.exports = BlockStatement;
