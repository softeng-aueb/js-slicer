const Identifier = require("./Identifier");
const Literal = require("./Literal");

class AssignmentStatement {
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
        //We use only the right part of the assignment as the left is not a variable use but an assignment.
        if (this._right instanceof Identifier) {
            varArray.push(this._right._name);
        } else if (!(this._right instanceof Identifier) && !(this._right instanceof Literal)) {
            varArray = varArray.concat(this._right.getUsedVariableNames());
        }
        return varArray;
    }

    getDefinedVariable() {
        return this._left._name;
    }

    accept(visitor) {
        visitor.visitAssignmentStatement(this);
    }

    // TODO: continue with asText logic
    asText() {
        return `${this._left.asText()} ${this._operator} ${this._right.asText()}`;
    }
}

module.exports = AssignmentStatement;
