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

    asText() {
        return typeof this._value === "string" ? `\'${this._value}\'` : `${this._value}`;
    }
}
module.exports = Literal;
