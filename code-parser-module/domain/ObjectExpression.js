const Identifier = require("./Identifier");
const Literal = require("./Literal");

class ObjectExpression{

    constructor(properties) {
        this._properties = properties;
    }

    get properties() {
        return this._properties;
    }

    set properties(value) {
        this._properties = value;
    }

    getUsedVariableNames(){
        return this.findAllUsedVariableNamesRecursively([]);
    }

    findAllUsedVariableNamesRecursively(varArray){
        for(let i in this._properties){
            varArray = varArray.concat(this._properties[i].getUsedVariableNames());
        }
        return varArray;

    }
}
module.exports = ObjectExpression;