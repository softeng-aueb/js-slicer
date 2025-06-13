const Identifier = require("./Identifier");
const Literal = require("./Literal");

class VariableDeclaration {
    constructor(type, names, values) {
        this._type = type;
        this._names = names;
        this._values = values;
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }

    get names() {
        return this._names;
    }

    set names(value) {
        this._names = value;
    }

    get values() {
        return this._values;
    }

    set values(values) {
        this._values = values;
    }

    getUsedVariableNames() {
        return this._values;
    }

    getDefinedVariable() {
        return this._names;
    }

    accept(visitor) {
        visitor.visitVariableDeclaration(this);
    }
}

module.exports = VariableDeclaration;
