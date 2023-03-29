const Parser = require("./code-parser-module/Parser");
const CFGGenerator = require("./control-flow-graph/CFGGenerator");
const FDTGenerator = require("./forward-dominance-tree/FDTGenerator");
const CDGGenerator = require("./control-dependency-graph/CDGGenerator");
const DDGGenerator = require("./data-dependence-graph/DDGGenerator");
const PDGGenerator = require("./program-dependence-graph/PDGGenerator");
const fs = require('fs');
const DDGEdge = require("./data-dependence-graph/domain/DDGEdge");
const CDGEdge = require("./control-dependency-graph/domain/CDGEdge");
const { generateCfg } = require("./control-flow-graph/CFGGenerator");

class JsSlicer {

  static cfg(func) {
    try {
      if (!func) {
        throw new Error("Missing required params.")
      }
      //Parse the given func
      let parsedFunc = Parser.parse(func);

      //Generate the control flow graph
      let cfg = CFGGenerator.generateCfg2(parsedFunc);

      return cfg;
    } catch (e) {
      console.log(e);
    }
  }

  static slice(func) {
    try {
      if (!func) {
        throw new Error("Missing required params.")
      }
      //Parse the given func
      let parsedFunc = Parser.parse(func);

      //Generate the control flow graph
      let cfg = CFGGenerator.generateCfg(parsedFunc);

      //Generate the forward dependence graph
      let fdt = FDTGenerator.generateFDT(cfg);

      //Generate control dependency graph from control flow graph and control dependence graph
      let cdg = CDGGenerator.generateCDG(cfg, fdt);

      //Generate the data dependence graph
      let ddg = DDGGenerator.generateDDG(cfg);

      //Generate the program dependence graph
      return PDGGenerator.generatePDG(cdg, ddg);
    } catch (e) {
      console.log(e);
    }
  }
}
module.exports = JsSlicer;

let func1 = `function isOdd (num){
  if(num % 2 !== 0){
    return true;
  }
  return false;
}`

let func2 = `
function foo(){
  let ar = [1, 2, 3]
  let a = 1
  while(a < ar.length){
    var b = 2
    a = a + 1
    if (a > 1){
      while(b >= 0){
        b--
        if(b < 0){
          b = -10
        }
        b=11
      }
    }            
    var c = 10
  }
  return a + b
}`

let func3 = `
  function foo(){
    let ar = [1, 2, 3]
    let a = 1
    if (a > 1){
        var b = 2
        a = b + a
        console.log(a)    
    } else if (a < 1) {
        var c = ar[0] + a
        a = a + c
        if (a == 0){
            console.log(a)
        } else {
          console.log(b)
        }
        console.log(c)
        if (a + c > 10){
          console.log(c)
        } else {
          console.log(a)
        }
    } else {
        var c = 1
        console.log(c)
    }
    return a + b
}`;

let func4 = `
function foo(){
  let ar = [1, 2, 3]
  let a = 1
  for(let i = 0; i < 10; i++){
      a = a + i
      if (a > 10){
        console.log(a)
      } else {
        console.log(i)
      }
      while(a > 0){
        a--
        console.log(a)
      }
  }
  return a + b
}`;

let func5 = `function getSum (array){
  let sum= 0;
  let i = 0;
  while(i< array.length){
    sum = sum + array[i];
    i=i+1;
  }
  return sum;
}`;

let func6 = `function nestedFor(array){
  let max= array[0];
  for(let i=0; i< array.length;i++){
    for(let j = 0; j < i; j++){
      if(max < array[i]){
        max = array[i];
      }
    }
  }
  return max;
}`;

let func7 = `
function foo(a, b){
  let ar = [1, 2, 3]
  for(let i = 0; i < ar.length; i++){
      if (ar[i] % 2 == 0){
          break;
      }
      for(let j = 0; j < i; j++){
          console.log(j)
          if (j %2 == 0){
              break;
          }
          if (j == 3){
              break;
          }
      }
  }
  return 0
}`;


let func8 = `
function foo(a, b){
  let ar = [1, 2, 3]
  let a = 10
  while(a > 0){
      console.log(a)
      let b = ar[a]
      if (b == 0){
          break;
      }
      while(b > 0){
          console.log(b)
          if (a == 0){
              break;
          }
      }
  }
}`;

let func9 = `(a, b) => {
  let y= a+b
  while (y+1>0 && y>1){
    y=y+1
  }
  return x + func(z,y,a)
}`;

// func4, func7 not working at all
// let result = JsSlicer.slice(func9.split("\n"))
// console.log(result)
// exportPDGToDot(result, 'func9')


//generatePDG()
generateCFG()

/*
Outputs .dot files to ./output directory.
Use Graphviz Interactive Preview (VS COde plugin) to preview the files
*/
function generateCFG() {

  let examples = [
    /*func1,*/
    func2,
    func3,
    func4, 
    func5, 
    func6,
    func7, 
    func8/*, 
    func9*/]
  let filenames = [
    /*'func1',*/
    'func2',
    'func3',
    'func4', 
    'func5', 
    'func6',
    'func7', 
    'func8'/*, 
  'func9'*/]
  for (let i = 0; i < examples.length; i++) {
    let result = JsSlicer.cfg(examples[i].split("\n"))
    result.print()
    exportCFGToDot(result, filenames[i])
  }
}


/*
Outputs .dot files to ./output directory.
Use Graphviz Interactive Preview (VS COde plugin) to preview the files
*/
function generatePDG() {

  let examples = [func1, func2, func3, func5, func6, func8, func9]
  let filenames = ['func1', 'func2', 'func3', 'func5', 'func6', 'func8', 'func9']
  for (let i = 0; i < examples.length; i++) {
    let result = JsSlicer.slice(examples[i].split("\n"))
    exportPDGToDot(result, filenames[i])
  }
}


function exportPDGToDot(pdg, filename) {
  let dot = writePDGToDot(pdg)
  fs.writeFileSync(`./output/${filename}.dot`, dot)
}

function exportCFGToDot(pdg, filename) {
  let dot = writeCFGToDot(pdg)
  fs.writeFileSync(`./output/cfg-${filename}.dot`, dot)
}

function writeCFGToDot(cfg) {
  let digraph = `digraph G {
        rankdir=TB;
        ranksep="0.2 equally";
        fontname="sans-serif";
        rotate="0";
        orientation="portrait";
        landscape="true";
        penwidth="0.1";
        edge [comment="Wildcard edge", 
              fontname="sans-serif", 
              fontsize=10, 
              colorscheme="blues3", 
              color=2, 
              fontcolor=3];
        node [fontname="serif", 
              fontsize=13, 
              fillcolor="1", 
              colorscheme="blues4", 
              color="2", 
              fontcolor="4", 
              style="filled"];`

  for (node of cfg.nodes) {
    digraph += `\t"${node._id}";\n`
  }
  for (node of cfg.nodes) {
    for (edge of node.edges) {
      digraph += `\t"${edge.source}" -> "${edge.target}"`
      let properties = []
      if (edge.condition) {
        properties.push(`label="${edge.condition}"`)
      }
      digraph += `[${properties.join(", ")}];\n`;
    }
  }
  digraph += "}"
  return digraph;
}


function writePDGToDot(pdg) {
  let digraph = `digraph G {
        rankdir=TB;
        ranksep="0.2 equally";
        fontname="sans-serif";
        rotate="0";
        orientation="portrait";
        landscape="true";
        penwidth="0.1";
        edge [comment="Wildcard edge", 
              fontname="sans-serif", 
              fontsize=10, 
              colorscheme="blues3", 
              color=2, 
              fontcolor=3];
        node [fontname="serif", 
              fontsize=13, 
              fillcolor="1", 
              colorscheme="blues4", 
              color="2", 
              fontcolor="4", 
              style="filled"];`

  for (node of pdg) {
    digraph += `\t"${node._id}";\n`
  }
  for (node of pdg) {
    for (edge of node._edges) {
      digraph += `\t"${edge._source}" -> "${edge._target}"`
      let properties = []
      if (edge._condition) {
        properties.push(`label="${edge._condition}"`)
      }
      if (edge instanceof DDGEdge) {
        properties.push(`style="dashed"`)
        properties.push(`color="1"`)
        properties.push(`label="${edge._dependantVariable}"`)
      } else if (edge instanceof CDGEdge) {
        //properties.push(``)
        //console.log(edge)
      }
      digraph += `[${properties.join(", ")}];\n`;
    }
  }
  digraph += "}"
  return digraph;
}

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