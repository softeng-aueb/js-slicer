const Parser = require("./code-parser-module/Parser");
const CFGGenerator = require("./control-flow-graph/CFGGenerator");
const FDTGenerator = require("./forward-dominance-tree/FDTGenerator");
const CDGGenerator = require("./control-dependency-graph/CDGGenerator");
const DDGGenerator = require("./data-dependence-graph/DDGGenerator");
const PDGGenerator = require("./program-dependence-graph/PDGGenerator");

class JsSlicer{
    static slice(func){
        try {
            if(!func){
                throw new Error("Missing required params.")
            }
            //Parse the given func
            let parsedFunc = Parser.parse(func);

            //Generate the control flow graph
            let cfg = CFGGenerator.generateCfg(parsedFunc);

            //Generate the forward dependence graph
            let fdt = FDTGenerator.generateFDT(cfg);

            //Generate control dependency graph from control flow graph and control dependence graph
            let cdg = CDGGenerator.generateCDG(cfg,fdt);

            //Generate the data dependence graph
            let ddg = DDGGenerator.generateDDG(cfg);

            //Generate the program dependence graph
            return PDGGenerator.generatePDG(cdg,ddg);
        }catch (e){
            console.log(e);
        }
    }
}
module.exports = JsSlicer;

let func = [
    "(a, b) => {",
    " let y= a+b",
    "while (y+1>0 && y>1){ ",
    " y=y+1",
    "}" ,
    " return x + func(z,y,a)",
    "}"
];

let result = JsSlicer.slice(func)
console.log()
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