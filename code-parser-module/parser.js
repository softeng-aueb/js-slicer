const recast = require("recast");
const FunctionAst = require("./domain/FunctionAst");
const FunctionObj = require("./domain/FunctionObj");
class Parser {

    static parse (functionString){
        //Parse the function and build an AST.
        const ast = new FunctionAst(recast.parse(functionString.join("\n")))

        if(!ast.isFunction()) throw new Error("Parsed code is not a function.");
        const functionName = ast.getFunctionName();
        const functionArgs = ast.getFunctionArgs();
        const functionType = ast.getFunctionType();
        const functionBody = ast.getFunctionBody();

        return new FunctionObj(functionName,functionArgs,functionBody,functionType);
    }


}

module.exports = Parser;

let func = Parser.parse([
    "(a, b) => {",
    "fun()",
    "let x = a+b; ",
    "x=a+b; ",
    "while (y>0){ ",
    " y=y+1",
    "} ",
    " return x",
    "}"
]);

// let func = Parser.parse([
//     "(a, b) => {",
//     "let x = a+b;",
//     "if(x>0){ ",
//     " return x+1; ",
//     "}else if(x === 0) { ",
//     " return x-1 ",
//     "}else{",
//     "  return x;",
//     "}",
//     "}"
// ]);

// let func = Parser.parse([
//     "() => {",
//     "a = 1;\n" ,
//     "b = a;\n" ,
//     "b = a+1;\n" ,
//     "b = a+1+func(5);\n" ,
//     "b = a+1+func(f(a,5));\n" ,
//     "c = a+c\n" ,
//     "d = a+b*c\n" ,
//     "a = a+b-c\n" ,
//     "a = b&&c\n" ,
//     "a = (a && b) ? a: b\n" ,
//     "a = (a && b) ? a: (b&&c) ? b: c\n" ,
//     "a = func(a)\n" ,
//     "a = func(a,b)\n" ,
//     "a = func(a,b,d(c)) ",
//     "}"
// ]);
