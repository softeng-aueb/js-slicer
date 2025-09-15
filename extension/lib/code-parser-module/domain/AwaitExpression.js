class AwaitExpression {
    constructor(argument) {
        this._argument = argument;
    }

    get argument() {
        return this._argument;
    }

    asText() {
        return `await ${this._argument.asText()}`;
    }

    accept(visitor) {
        visitor.visitAwaitExpression(this);
    }
}
module.exports = AwaitExpression;
