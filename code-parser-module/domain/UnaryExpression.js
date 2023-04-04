const Identifier = require("./Identifier");
const Literal = require("./Literal");

class UnaryExpression{
    constructor(argument,operator) {
        this._argument = argument;
        this._operator = operator;
    }


    get argument() {
        return this._argument;
    }

    set argument(value) {
        this._argument = value;
    }

    get operator() {
        return this._operator;
    }

    set operator(value) {
        this._operator = value;
    }

    getUsedVariableNames(){
        let varArray = []
        if(this._argument instanceof Identifier){
            varArray.push(this._argument._name);
            //return varArray
        }else if(!(this._argument instanceof Identifier) && !(this._argument instanceof Literal)){
            varArray = varArray.concat(this.argument.getUsedVariableNames());
        }

        return varArray;
    }

    accept(visitor){
        visitor.visitUnaryExpression(this)
    }
}

module.exports = UnaryExpression;