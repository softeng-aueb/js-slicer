const Identifier = require("./Identifier");
const Literal = require("./Literal");

class LogicalExpression {
    constructor(left, right, operator) {
        this._left = left;
        this._right = right;
        this._operator = operator;
    }

    get left() {
        return this._left;
    }

    set left(value) {
        this._left = value;
    }

    get right() {
        return this._right;
    }

    set right(value) {
        this._right = value;
    }

    get operator() {
        return this._operator;
    }

    set operator(value) {
        this._operator = value;
    }

    getUsedVariableNames() {
        let varArray = [];
        if (this._left instanceof Identifier) {
            varArray.push(this._left._name);
        } else if (!(this._left instanceof Identifier) && !(this._left instanceof Literal)) {
            varArray = varArray.concat(this.left.getUsedVariableNames());
        }

        if (this._right instanceof Identifier) {
            varArray.push(this._right._name);
        } else if (!(this._right instanceof Identifier) && !(this._right instanceof Literal)) {
            varArray = varArray.concat(this._right.getUsedVariableNames());
        }

        return varArray;
    }

    accept(visitor) {
        visitor.visitLogicalExpression(this);
    }
}

module.exports = LogicalExpression;
