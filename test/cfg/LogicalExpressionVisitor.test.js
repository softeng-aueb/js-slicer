const Parser = require("../../code-parser-module/Parser.js");
const FUNCTION_TYPES = require("../../code-parser-module/constants/functionTypes");
const CFGGenerator = require("../../control-flow-graph/CFGGenerator");
const CFGVisualizer = require("../../control-flow-graph/CFGVisualizer");
function expectHasEdge(cfg, source, target) {
    expect(cfg.hasEdge(source, target)).toBe(true);
}

function expectHasExitNode(cfg, node) {
    expect(cfg.hasExitNode(node)).toBe(true);
}

function showCFG(cfg, filename) {
    let visualizer = new CFGVisualizer(cfg, filename);
    visualizer.exportToDot();
}

function parse(str) {
    return Parser.parse(str.split("\n"));
}

/**
 * Should support the correct creation of CFGs with composite conditions v1
 */
it("composite conditions v1", () => {
    let code = `
    function foo(a,b){
        let c=a+b;
        //   2       3        4       5       6        7
        if((b>5 && c>10) || (a>2 || (a<c && b>23)) && a<=b){
            console.log('case true');
        }
        else{
            console.log('case false');
        }
        return a+b;
    }`;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "LogExpTest1");
    //assertions...
});
