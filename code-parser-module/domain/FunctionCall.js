const Identifier = require("./Identifier");
const Literal = require("./Literal");

class FunctionCall {
    constructor(name, args) {
        this._name = name;
        this._args = args;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get args() {
        return this._args;
    }

    set args(value) {
        this._args = value;
    }

    getUsedVariableNames() {
        let varArray = [];
        for (let i in this._args) {
            let arg = this._args[i];

            if (arg instanceof Identifier) {
                varArray.push(arg._name);
            } else if (!(arg instanceof Identifier) && !(arg instanceof Literal)) {
                varArray = varArray.concat(arg.getUsedVariableNames());
            }
        }
        return varArray;
    }

    accept(visitor) {
        visitor.visitFunctionCall(this);
    }

    asText() {
        let str = "";
        for (let arg of this._args) {
            str = str.concat(arg.asText(), ", ");
        }
        str = str.slice(0, -2);
        return `${this._name.asText()}(${str})`;
    }
}

module.exports = FunctionCall;
