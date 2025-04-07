const Parser = require('../../code-parser-module/Parser.js');
const FUNCTION_TYPES = require('../../code-parser-module/constants/functionTypes')
const CFGGenerator = require('../../control-flow-graph/CFGGenerator');
const LogicalExpressionVisitor = require('../../control-flow-graph/LogicalExpressionVisitor.js');
const LogicalExpressionFinder = require('./LogicalExpressionFinder');

function expectHasEdge(cfg, source, target) {
  expect(cfg.hasEdge(source, target)).toBe(true)
}


it('should support composite logical expressions', () => {
  let code = `
    function foo(a, b) {
        let y=a+b
        if (y+1>0 && y>1){
          y=y+1
        }
        return x + func(z,y,a)
      }
    `
  let functionObj = parse(code)
  let logicalExpressionFinder = new LogicalExpressionFinder()
  functionObj.accept(logicalExpressionFinder)

  let logicalExpression = logicalExpressionFinder.result[0]
  //console.log(logicalExpression)
  let visitor = new LogicalExpressionVisitor()
  logicalExpression.accept(visitor)


  printNodes(visitor.nodes)

  //let cfg = CFGGenerator.generateCfg2(functionObj)
  //cfg.print()
  //expect(cfg.nodes.length).toBe(5)
  // expectHasEdge(cfg, 2, 3) 
  // expectHasEdge(cfg, 3, 4) 
  // expectHasEdge(cfg, 6, 7) // break control flow
  // expectHasEdge(cfg, 8, 3) // loop back to outer loop
  // expectHasEdge(cfg, 11, 3) // break to outer loop
})

function parse(str) {
  return Parser.parse(str.split('\n'));
}

function printNodes(nodes) {
  let lines = []
  for (let node of nodes) {
    let targets = node.edges.map(e => e.targetNode.id)
    lines.push(`Node: ${node.id} -> ${targets.join(", ")}`)
  }
  console.log(lines.join("\n"))
}