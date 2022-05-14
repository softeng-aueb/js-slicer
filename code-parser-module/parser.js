const recast = require("recast");
const FunctionAst = require("./domain/FunctionAst");
class Parser {

    static parse (functionString){
        //Parse the function and build an AST.
        const ast = new FunctionAst(recast.parse(functionString.join("\n")))

        if(!ast.isFunction()) throw new Error("Parsed code is not a function.");
        const functionName = ast.getFunctionName();
        const functionArgs = ast.getFunctionArgs();
        const functionType = ast.getFunctionType();
        const functionBody = ast.getFunctionBody();

        console.log(recast.parse(functionString.join("\n")))
    }


}

Parser.parse([
    "function add(a, b) {",
    "let x = a+b;",
    "  return x;",
    "}"
]);
