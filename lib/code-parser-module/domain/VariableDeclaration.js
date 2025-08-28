const Identifier = require("./Identifier");
const Literal = require("./Literal");

class VariableDeclaration {
    constructor(type, names, values) {
        this._type = type;
        this._names = names;
        this._values = values;
        this._uniqueText;
    }

    get type() {
        return this._type;
    }

    get uniqueText() {
        return this._uniqueText;
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

    set uniqueText(text) {
        this._uniqueText = text;
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

    asText() {
        // unique text is used when a variable declaration is used in foreach loops
        // where normally it is not shown with context (shown without any indication of where it originates)
        if (this._uniqueText) return this._uniqueText;

        let index = 0;
        let str = "";
        while (index < this.values.length) {
            str += `${this._names[index].asText()}`;
            if (this.values[index]) {
                str += ` = ${this.values[index].asText()}`;
            }
            if (index + 1 !== this.values.length) {
                str += `, `;
            }
            index++;
        }
        return `${this._type} ${str}`;
    }
}

module.exports = VariableDeclaration;
