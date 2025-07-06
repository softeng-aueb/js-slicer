class Literal {
    constructor(value) {
        this._value = value;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }

    accept(visitor) {
        visitor.visitLiteral(this);
    }
}
module.exports = Literal;
