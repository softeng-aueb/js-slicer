const Identifier = require("./Identifier");
const Literal = require("./Literal");

class ReturnStatement {
    constructor(value) {
        this._value = value;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }

    getUsedVariableNames(){
        if(this._value instanceof Identifier)
            return [this._value._name];

        if(this._value instanceof Literal)
            return [];

        return this._value.getUsedVariableNames();
    }
}
module.exports = ReturnStatement;