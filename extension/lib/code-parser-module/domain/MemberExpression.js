const Identifier = require("./Identifier");
const Literal = require("./Literal");

class MemberExpression {
    constructor(object, property, computed) {
        this._object = object;
        this._property = property;
        this._computed = computed;
    }

    get object() {
        return this._object;
    }

    set object(value) {
        this._object = value;
    }

    get property() {
        return this._property;
    }

    set property(value) {
        this._property = value;
    }

    get computed() {
        return this._computed;
    }

    getUsedVariableNames() {
        let varArray = [];
        if (this._object instanceof Identifier) {
            varArray.push(this._object._name);
            //return varArray
        } else if (!(this._object instanceof Identifier) && !(this._object instanceof Literal)) {
            varArray = varArray.concat(this._object.getUsedVariableNames());
        }

        if (this._property instanceof Identifier) {
            varArray.push(this._property._name);
            // return varArray
        } else if (!(this._property instanceof Identifier) && !(this._property instanceof Literal)) {
            varArray = varArray.concat(this._property.getUsedVariableNames());
        }

        return varArray;
    }

    accept(visitor) {
        visitor.visitMemberExpression(this);
    }

    asText() {
        return `${this._object.asText()}${this._computed ? `[${this._property.asText()}]` : `.${this._property.asText()}`}`;
    }
}
module.exports = MemberExpression;
