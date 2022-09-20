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

let func = Parser.parse([
    "(a, b) => {",
    "if (y>0 && y>1){ ",
    " y=y+1",
    "}else if (y== 0){" +
    " y=y+2;" +
    "}else{ ",
    " y=y/2; ",
    "}",
    " return x",
    "}"
]);
// let func = [
//    "function findNumberType (number){\n" +
//    "  if(number % 2 === 0){\n" +
//    "    console.log(\"Number is even\")\n" +
//    "  }else{\n" +
//    "    console.log(\"Number is odd\")\n" +
//    "  } \n" +
//    "}"
// ]


// let func = [
// "function getSum (array){\n" +
// "  let sum= 0;\n" +
// "\n" +
// "  for(let i=0; i< array.length;i++){\n" +
// "    sum = sum + array[i]\n" +
// "  }\n" +
// "\n" +
// "  return sum;\n" +
// "}"
// ]

// let func = [
// "function getMax (array){\n" +
// "  let max= array[0];\n" +
// "\n" +
// "  for(let i=0; i< array.length;i++){\n" +
// "    if(max < array[i]){\n" +
// "      max = array[i];\n" +
// "    }\n" +
// "  }\n" +
// "\n" +
// "  return max;\n" +
// "}"
// ]
// let func = [
//     "function isOdd (num){\n" +
//     "  if(num % 2 !== 0){\n" +
//     "    num = num +1;\n" +
//     "  }\n" +
//     "  return false;\n" +
//     "}"
// ]

// let func = [
//     "function test (){\n" +
//     "  let y=1;\n" +
//     "  let x= 2;\n" +
//     "  return x+y;\n" +
//     "\n" +
//     "}"
// ]
// let func = [
//     "(a, b) => {",
//     " let y= a+b",
//     "while (y+1>0 && y>1){ ",
//     " y=y+1",
//     "}" ,
//     " return x + func(z,y,a)",
//     "}"
// ];

let result = JsSlicer.slice(func)
console.log()

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