class ThrowStatement {
    constructor(argument) {
        this._argument = argument;
    }

    get argument() {
        return this._argument;
    }

    asText() {
        return `throw ${this._argument.asText()}`;
    }

    accept(visitor) {
        visitor.visitThrowStatement(this);
    }
}
module.exports = ThrowStatement;
