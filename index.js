const Parser = require("./code-parser-module/Parser");
const CFGGenerator = require("./control-flow-graph/CFGGenerator");
const FDTGenerator = require("./forward-dominance-tree/FDTGenerator");
const CDGGenerator = require("./control-dependency-graph/CDGGenerator");

class JsSlicer{
    static slice(func){
        try {
            if(!func){
                throw new Error("Missing required params.")
            }
            let parsedFunc = Parser.parse(func);
            let cfg = CFGGenerator.generateCfg(parsedFunc);
            let fdt = FDTGenerator.generateFDT(cfg);
            let cdg = CDGGenerator.generateCDG(cfg,fdt)
        }catch (e){
            console.log(e);
        }
    }
}
module.exports = JsSlicer;

let func = [
    "(a, b) => {",
    "while (y>0 && y>1){ ",
    " y=y+1",
    "}" ,
    " return x",
    "}"
];

JsSlicer.slice(func)

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