const Parser = require("../../code-parser-module/Parser.js");
const CFGGenerator = require("../../control-flow-graph/CFGGenerator");
const CFGVisualizer = require("../../control-flow-graph/CFGVisualizer");
function expectHasEdge(cfg, source, target) {
    expect(cfg.hasEdge(source, target)).toBe(true);
}

function showCFG(cfg, filename) {
    let visualizer = new CFGVisualizer(cfg, filename);
    visualizer.exportToDot();
}

function parse(str) {
    return Parser.parse(str.split("\n"));
}

/**
 *
 *      This test suite is focused on testing the fuctionality and correctness of the
 *      Composite Conditions Visitor module. Tests include basic and advanced cases of logical expressions
 *      that can be found in If and Ternary statements.
 *
 *      Each test includes the exact numbered label above or next to an expression that matches the order
 *      in which a node is parsed within the CFG for better understanding of the test.
 *
 *      Global exit node of the function always has the largest number as its label.
 */

/**
 * Should support the correct creation of CFGs with composite conditions
 */
it("composite conditions v1", () => {
    let code = `
    function foo(a,b){
        let c=a+b;
    //ids    2       3        4       5       6        7
        if((b>5 && c>10) || (a>2 || (a<c && b>23)) && a<=b){
            foo2(a,b);       // 8
            return true;     // 9
        }
        else{
            foo2(b,c);      // 10
            return false;   // 11
        }
        
    }`;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CompCondTest1");
    expectHasEdge(cfg, 2, 4); //if 2 is false, it should jump to 4
    expectHasEdge(cfg, 5, 10); //if 5 is false, it should jump to Alternate
    expectHasEdge(cfg, 4, 7); //if 4 is true, it should jump to 7
    expectHasEdge(cfg, 3, 8); //if 3 is true, it should jump to Then
    expectHasEdge(cfg, 5, 10); //if 5 is false, it should jump to Alternate
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
            return a+b     // 9
        }
        else{
            return a-b     // 10
        }
    }
    `;

    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CompCondTest2");
    expectHasEdge(cfg, 2, 3); //if 2 is false, it should jump to 3
    expectHasEdge(cfg, 3, 4); //if 3 is false, it should jump to 4
    expectHasEdge(cfg, 4, 5); //if 4 is true, it should jump to 5
    expectHasEdge(cfg, 4, 6); //if 4 is false, it should jump to 6
    expectHasEdge(cfg, 5, 7); //if 5 is true, it should jump to 7
    expectHasEdge(cfg, 6, 7); //if 6 is true, it should jump to 7
    expectHasEdge(cfg, 5, 10); //if 5 is false, it should jump to Alternate
    expectHasEdge(cfg, 6, 10); //if 6 is false, it should jump to Alternate
});

/**
 * Should support a lone ternary statement
 */
it("composite conditions v3", () => {
    let code = `
    function foo(a,b){
        let c = a+b;
    //ids:  2      3      4
        if(c>10 ? a<2 : b<2){
            return a    // 5
        }
        else{
            return b    // 6
        }
    }
    `;

    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CompCondTest3");
    expectHasEdge(cfg, 2, 4); //if 2 is false, it should jump to 4
    expectHasEdge(cfg, 3, 5); //if 3 is true, it should jump to Then
    expectHasEdge(cfg, 4, 5); //if 4 is true, it should jump to Then
    expectHasEdge(cfg, 3, 6); //if 3 is false, it should jump to Alternate
    expectHasEdge(cfg, 4, 6); //if 4 is false, it should jump to Alternate
});

/**
 * Should support logical expressions within then/alternate blocks of ternary statements
 */
it("composite conditions v4", () => {
    let code = `
    function foo(a,b){
        let c = a+b;
    //ids:   2      3      4     5      6      7
        if((a>10 ? b<c && c<a : d>5 || e<c) && f>3){
            return a     // 8
        }
        else{
            return b    // 9   
        }
    }
    `;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CompCondTest4");
    expectHasEdge(cfg, 2, 5); //if 2 is false, it should jump to 5
    expectHasEdge(cfg, 3, 9); //if 3 is false, it should jump to Alternate
    expectHasEdge(cfg, 4, 7); //if 4 is true, it should jump to 7
    expectHasEdge(cfg, 5, 6); //if 5 is false, it should jump to 6
    expectHasEdge(cfg, 5, 7); //if 5 is true, it should jump to 7
    expectHasEdge(cfg, 6, 9); //if 6 is false, it should jump to Alternate
});

/**
 * Should recursively support the existence of ternary statements within ternary statements
 */
it("composite conditions v5", () => {
    let code = `
    function foo(a,b){
        let c = a+b;
    //ids:  2     3      4     5     6       7
        if(a>b ? b>5 : (b<a ? a<c : b<c && c>20) ){
            return a    // 8
        }
        else{
            return b    // 9
        }
    }
    `;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CompCondTest5");
    expectHasEdge(cfg, 2, 4); //if 2 is false, it should jump to 4
    expectHasEdge(cfg, 4, 6); //if 4 is false, it should jump to 6
    expectHasEdge(cfg, 6, 9); //if 6 is false, it should jump to Alternate
    expectHasEdge(cfg, 6, 7); //if 6 is true, it should jump to 7
    expectHasEdge(cfg, 7, 9); //if 7 is false, it should jump to Alternate
    expectHasEdge(cfg, 7, 8); //if 7 is true, it should jump to Then
});

/**
 * Should support negation of expressions
 */
it("composite conditions v6", () => {
    let code = `
    function foo(a,b){
        let c = a+b;
    //ids:    2      3          4       5         
        if(!(a>5 && b<3) || (!(a>4) && b<4)){
            return a    // 6
        }
        else{
            return b    // 7
        }
    }
    `;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CompCondTest6");
    expectHasEdge(cfg, 2, 6); //if 2 is false, it should jump to Then
    expectHasEdge(cfg, 2, 3); //if 2 is true, it should jump to 3
    expectHasEdge(cfg, 3, 6); //if 3 is false, it should jump to Then
    expectHasEdge(cfg, 3, 4); //if 3 is true, it should jump to 4
    expectHasEdge(cfg, 4, 5); //if 4 is false, it should jump to 5
    expectHasEdge(cfg, 4, 7); //if 4 is true, it should jump to Alternate
});

/**
 * Should support negation of expressions within ternary statements
 */
it("composite conditions v7", () => {
    let code = `
    function foo(a,b){
    let c = a + b;
    //ids:     2      3         4        5        6         7      8
        if( ((a>4 || b<4) && !(b>a)) ? b>20 || !(a>30) : !(b<2 || a>5)  ){
            return a    // 9
        }
        else{
            return b    // 10
        }
    }
    `;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CompCondTest7");
    expectHasEdge(cfg, 2, 4); //if 2 is false, it should jump to 4
    expectHasEdge(cfg, 4, 5); //if 4 is false, it should jump to 5
    expectHasEdge(cfg, 4, 7); //if 4 is true, it should jump to 7
    expectHasEdge(cfg, 6, 10); //if 6 is true, it should jump to Alternate
    expectHasEdge(cfg, 6, 9); //if 6 is false, it should jump to Then
    expectHasEdge(cfg, 7, 10); //if 7 is true, it should jump to Alternate
    expectHasEdge(cfg, 8, 10); //if 8 is true, it should jump to Alternate
    expectHasEdge(cfg, 8, 9); //if 8 is false, it should jump to Then
});

/**
 * Should support a single expression in the conditional
 */
it("composite conditions v8", () => {
    let code = `
    function foo(a,b){
    let c = a + b; //1
         //2
        if(c){
            return a    // 3
        }
        else{
            return b    // 4
        }
    }
    `;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CompCondTest8");
    //    expectHasEdge(cfg, 2, 4); //if 2 is false, it should jump to 4
});
