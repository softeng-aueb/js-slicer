const AST_OBJECT_TYPES = require("../constants/astObjectTypes");
const FUNCTION_TYPES = require("../constants/functionTypes");
const FunctionParam = require("../classes/FunctionParam");

class FunctionAst {
    constructor(ast) {
        this.ast = ast;
        this.codeParsedObj = this.ast && this.ast.program && this.ast.program.body && this.ast.program.body[0];
    }



    isFunction() {
        return this.codeParsedObj && this.codeParsedObj.type === AST_OBJECT_TYPES.FUNCTION_DECLARATION;
    }

    getFunctionName() {
        return this.codeParsedObj.id && this.codeParsedObj.id.name;
    }

    getFunctionArgs(){
        const params = this.codeParsedObj && this.codeParsedObj.params || [];
        return params.map(p => new FunctionParam(p.type, p.name));
    }

    getFunctionType(){
        if(this.codeParsedObj && this.codeParsedObj.async === true) return FUNCTION_TYPES.ASYNC;
        return FUNCTION_TYPES.SYNC;
    }
}

module.exports = FunctionAst;