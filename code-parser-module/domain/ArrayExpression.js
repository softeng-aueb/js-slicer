const Identifier = require("./Identifier");
const Literal = require("./Literal");

class ArrayExpression{
    constructor(elements) {
        this._elements = elements;
    }


    get elements() {
        return this._elements;
    }

    set elements(value) {
        this._elements = value;
    }

    accept(visitor){
        visitor.visitArrayExpression(this)
    }
}

module.exports = ArrayExpression;