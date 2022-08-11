const Identifier = require("./Identifier");
const Literal = require("./Literal");

class AssignmentStatement{
    constructor(left,right,operator) {
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

    getUsedVariableNames(){
      return this.findAllUsedVariableNamesRecursively([]);
    }

    findAllUsedVariableNamesRecursively(varArray){
       //We use only the right part of the assignment as the left is not a variable use but an assignment.
        if(this._right instanceof Identifier){
            varArray.push(this._right._name);
        }else if(!(this._right instanceof Identifier) && !(this._right instanceof Literal)){
            varArray=this._right.findAllUsedVariableNamesRecursively(varArray);
        }
        return varArray;
    }

    getDefinedVariable(){
        return this._left._name;
    }
}

module.exports = AssignmentStatement;