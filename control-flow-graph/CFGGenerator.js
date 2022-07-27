const FunctionObj = require("../code-parser-module/domain/FunctionObj");
const AST_OBJECT_TYPES = require("../code-parser-module/constants/astObjectTypes");
const BlockNode = require("./domain/CFGNode");
const ConditionalStatement = require("../code-parser-module/domain/ConditionalStatement");
const {getNodeEdges, getConditionalStatementCFGNodes,getLoopStatementCFGNodes} = require("./helpers/cfgNodesHelpers")
const Parser = require("../code-parser-module/Parser");
const LoopStatement = require("../code-parser-module/domain/LoopStatement");
const CFGNode = require("./domain/CFGNode");

class CFGGenerator {

    static generateCfg(functionObj){
        let counterId = 0;
        if(!functionObj && !functionObj instanceof FunctionObj){
            throw new Error(`Missing required param.`)
        }

       let nodes =  functionObj.body.flatMap(st => {
           if(st instanceof ConditionalStatement){
               const {conditionalCFGNodes, counter} = getConditionalStatementCFGNodes(functionObj.body,st,counterId,[]);
               counterId = counter;
               return  conditionalCFGNodes;
           } else if(st instanceof LoopStatement){
               const {loopCFGNodes, counter} = getLoopStatementCFGNodes(functionObj.body,st,counterId,[]);
               counterId = counter;
               return  loopCFGNodes;
           } else{
               counterId++;
               return new CFGNode (counterId,null,st,getNodeEdges(functionObj.body,st,counterId))
           }
       });

        return nodes;
    }
}
module.exports = CFGGenerator;


let func = Parser.parse([
    "(a, b) => {",
    "while (y>0 && y>1){ ",
    " y=y+1",
    "}" ,
    " return x",
    "}"
]);

// let func = Parser.parse([
//     "(a, b) => {",
//     "if (y>0 && y>1){ ",
//     " y=y+1",
//     "}else if (y== 0){" +
//     " y=y+2;" +
//     "}else{ ",
//     " y=y/2; ",
//     "}",
//     " return x",
//     "}"
// ]);
// let func = Parser.parse([
//     "(a, b) => {",
//     "fun()",
//     "let ff = {a:1,b:{c:1}}; ",
//     "let x = a+b; ",
//     "x=a+b; ",
//     "if (y>0){ ",
//     " y=y+1",
//     "}else if (y== 0){" +
//     " y=y+2;" +
//     "}else{ ",
//     " y=y/2; ",
//     "}",
//     " return x",
//     "}"
// ]);

CFGGenerator.generateCfg(func)

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