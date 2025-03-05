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
 * Should support the correct creation of CFGs with composite conditions
 */
it("composite conditions v1", () => {
    let code = `
    function foo(a,b){
        let c=a+b;
    //ids    2       3        4       5       6        7
        if((b>5 && c>10) || (a>2 || (a<c && b>23)) && a<=b){
            foo2(a,b);
            return true;
        }
        else{
            foo2(b,c);
            return false;
        }
        
    }`;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "LogExpTest1");
    expectHasEdge(cfg, 2, 4); //if 2 is false, it should jump to 4
    expectHasEdge(cfg, 5, 9); //if 5 is false, it should jump to False node
    expectHasEdge(cfg, 4, 7); //if 4 is true, it should jump to 7
    expectHasEdge(cfg, 3, 8); //if 3 is true, it should jump to True node
    expectHasEdge(cfg, 5, 9); //if 5 is false, it should jump to False node
});

/**
 * Should support ternary operator in composite conditions
 */
it("composite conditions v2", () => {
    let code = `
    function foo(a,b){
        let c = a+b; 
    //ids:  2         3      4     5     6        7       8
        if(a>20 && ((a>b || b<c ? a>c : b>c) && (c>10 || c<2))){
            return a+b
        }
        else{
            return a-b
        }
    }
    `;

    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "LogExpTest2");
    expectHasEdge(cfg, 2, 3); //if 2 is false, it should jump to 3
    expectHasEdge(cfg, 3, 4); //if 3 is false, it should jump to 4
    expectHasEdge(cfg, 4, 5); //if 4 is true, it should jump to 5
    expectHasEdge(cfg, 4, 6); //if 4 is false, it should jump to 6
    expectHasEdge(cfg, 5, 7); //if 5 is true, it should jump to 7
    expectHasEdge(cfg, 6, 7); //if 6 is true, it should jump to 7
    expectHasEdge(cfg, 5, 10); //if 5 is false, it should jump to False node
    expectHasEdge(cfg, 6, 10); //if 6 is false, it should jump to False node
});

/**
 * Should support single conditional statements
 */
it("composite conditions v3", () => {
    let code = `
    function foo(a,b){
        let c = a+b;
        if(c>10 ? a<2 : b<2){
            return a
        }
        else{
            return b
        }
    }
    `;

    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "LogExpTest3");
    expectHasEdge(cfg, 2, 4); //if 2 is false, it should jump to 4
    expectHasEdge(cfg, 3, 5); //if 3 is true, it should jump to 5
    expectHasEdge(cfg, 4, 5); //if 4 is true, it should jump to 5
    expectHasEdge(cfg, 3, 6); //if 3 is false, it should jump to 6
    expectHasEdge(cfg, 4, 6); //if 4 is false, it should jump to 6
});
