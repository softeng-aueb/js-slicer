const Identifier = require("./Identifier");
const Literal = require("./Literal");

class ObjectExpression {
    constructor(properties) {
        this._properties = properties;
    }

    get properties() {
        return this._properties;
    }

    set properties(value) {
        this._properties = value;
    }

    getUsedVariableNames() {
        let varArray = [];
        for (let i in this._properties) {
            varArray = varArray.concat(this._properties[i].getUsedVariableNames());
        }
        return varArray;
    }

    asText() {
        let str = "";
        for (let prop of this._properties) {
            str = str.concat(prop.asText(), ", ");
        }
        str = str.slice(0, -2);
        return `{${str}}`;
    }
}
module.exports = ObjectExpression;
