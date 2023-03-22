const Identifier = require("./Identifier");
const Literal = require("./Literal");

class UpdateExpression{
    constructor(argument,prefix,operator) {
        this._argument = argument;
        this._prefix = prefix;
        this._operator = operator;
    }


    get argument() {
        return this._argument;
    }

    set argument(value) {
        this._argument = value;
    }

    get prefix() {
        return this._prefix;
    }

    set prefix(value) {
        this._prefix = value;
    }

    get operator() {
        return this._operator;
    }

    set operator(value) {
        this._operator = value;
    }

    getUsedVariableNames(){
        let varArray = [];
        //We use only the right part of the assignment as the left is not a variable use but an assignment.
        if(this._argument instanceof Identifier){
            varArray.push(this._argument._name);
        }
        // else if(!(this._prefix instanceof Identifier) && !(this._prefix instanceof Literal)){
        //     varArray = varArray.concat(this._prefix.getUsedVariableNames());
        // }
        return varArray;
    }


    getDefinedVariable(){
        return this._argument._name;
    }
}

module.exports = UpdateExpression;