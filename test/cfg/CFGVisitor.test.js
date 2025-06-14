const Parser = require("../../code-parser-module/Parser.js");
const FUNCTION_TYPES = require("../../code-parser-module/constants/functionTypes");
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
 *      CFG Visitor module. Tests include basic and advanced cases of combining complex structures like
 *      different types of loops together or alone.
 *
 *      Each test includes the exact numbered label above or next to an expression that matches the order
 *      in which a node is parsed within the CFG for better understanding of the test.
 *
 *      Global exit node of the function always has the largest number as its label.
 *
 */

/**
 * Should support lone for loops
 */
it("visitor v1", () => {
    let code = `
    function foo(a,b){  //IDS:
    let c = a + b; //1
    console.log(a); //2
        //3      //4    //13
    for(let i=0; i<c; i++){
            //5
        if(i>5){
            a--; //6
            break; //7
        }
                //8
        else if(i==3){
            a++; //9
            continue; //10
        }
        else{
            b++; //11
        }
        console.log(a+b); //12
    }
    return; //14
}
    `;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CFGVisitor1");
    expectHasEdge(cfg, 4, 5); // 4 should lead to 5 if true
    expectHasEdge(cfg, 4, 14); // 4 should lead to 14 if false
    expectHasEdge(cfg, 7, 14); // 7 should lead to 14 because of break
    expectHasEdge(cfg, 10, 13); // 10 should lead to update expression (13) because it is a for loop.
    expectHasEdge(cfg, 12, 13); // 12 should lead to update expression (13).
    expectHasEdge(cfg, 13, 4); // Update expression (13) should lead to condition node (4).
});

/**
 * Should support lone while loops
 */
it("visitor v2", () => {
    let code = `
    function foo(a,b){  
                //IDS:
    let c = a + b; //1
    let i = 0; //2
    console.log(a); //3

         //4   
    while(i<c){
            //5
        if(i>5){
            a--; //6
            break; //7
        }
                //8
        else if(i==3){
            a++; //9
            continue; //10
        }
        else{
            b++; //11
        }
        console.log(a+b); //12
        i++; //13
    }
    return; //14
}
    `;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CFGVisitor2");
    expectHasEdge(cfg, 4, 5); // 4 should lead to 5 if true
    expectHasEdge(cfg, 4, 14); // 4 should lead to 14 if false
    expectHasEdge(cfg, 7, 14); // 7 should lead to 14 because of break
    expectHasEdge(cfg, 10, 4); // 10 should lead to 4 because it is a while loop.
    expectHasEdge(cfg, 13, 4); // 13 should lead to condition node (4).
});

/**
 * Should support lone do..while loops
 */
it("visitor v3", () => {
    let code = `
    function foo(a,b){  
                //IDS:
    let c = a + b; //1
    let i = 0; //2
    console.log(a); //3
    a++; //4
    do{
        if(i>5){ //5
            a--; //6
            break; //7
        }
        else if(i==3){//8
            a++; //9
            continue; //10
        }
        else{
            b++; //11
        }
        console.log(a+b); //12
        i++; //13
    }while(i<c)//14
    return; //15
}
    `;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CFGVisitor3");
    expectHasEdge(cfg, 4, 5); // 4 should lead to 5
    expectHasEdge(cfg, 7, 15); // 7 should lead to 15 because of break
    expectHasEdge(cfg, 10, 14); // 10 should lead to 14 because it is a do..while loop.
    expectHasEdge(cfg, 13, 14); // 13 should lead to condition node (14).
    expectHasEdge(cfg, 14, 15); // 14 should lead to 15 if false.
    expectHasEdge(cfg, 14, 5); // 14 should lead to 5 if true.
});

/**
 * Should support do..while within do..while loops
 */
it("visitor v4", () => {
    let code = `
    function foo(a,b){  
                //IDS:
    do{
        do{
        a-- //1
        b++ //2
        }while(a<b) //3
    }while(a<a-b) //4
    
}
    `;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CFGVisitor4");
    expectHasEdge(cfg, 4, 1); // loop back target for outside loop should be 1, if true
    expectHasEdge(cfg, 3, 1); // loop back target for inside loop should be 1, if true
    expectHasEdge(cfg, 3, 4); // 3 should lead to 4 if false
});

/**
 * Should support do..while loops with conditionals as the first statement
 */
it("visitor v5", () => {
    let code = `
    function foo(a,b){  
                //IDS:
    do{
        if(a>b){ //1 
            a++ //2
        }
        else{
            a-- //3
        }
    }while(a>b) //4
    
}
    `;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CFGVisitor5");
    expectHasEdge(cfg, 4, 1); // loop back target should be 1
    expectHasEdge(cfg, 2, 4); // 2 should lead to 4
    expectHasEdge(cfg, 3, 4); // 3 should lead to 4
});

/**
 * Should support for loops with conditionals as the last statement
 */
it("visitor v6", () => {
    let code = `
    function foo(a,b){  
                //IDS:
        //1      //2    // 7
    for(let i=0; i<a+b; i++){
        console.log(i); //3
        if(a>i){ //4
            a++; //5
        }
        else{
            a--; //6
        }
    }
    
}
    `;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CFGVisitor6");
    expectHasEdge(cfg, 2, 8); // 2 leads to 8 if false
    expectHasEdge(cfg, 5, 7); // 5 leads to update statement 7
    expectHasEdge(cfg, 6, 7); // 6 leads to update statement 7
    expectHasEdge(cfg, 7, 2); // 7 loops back to 2
});

/**
 * Should support for loops with a while loop as the last statement
 */
it("visitor v7", () => {
    let code = `
    function foo(a,b){  
                //IDS:
        //1      //2    // 8
    for(let i=0; i<a+b; i++){
        console.log(i); //3
        while(a>b){ //4
            if(a!=b){ //5
                break; //6
            }
            console.log(a); //7
        }
    }
    
}
    `;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CFGVisitor7");
    expectHasEdge(cfg, 4, 8); // 4 leads to 8 if false
    expectHasEdge(cfg, 6, 8); // 6 leads to 8
    expectHasEdge(cfg, 7, 4); // 7 leads to 4
    expectHasEdge(cfg, 2, 9); // 2 leads to 9 if false
});

/**
 * Should support for loops with a for loop as the last statement
 */
it("visitor v8", () => {
    let code = `
    function foo(a,b){  
                //IDS:
        //1      //2    // 8
    for(let i=0; i<a+b; i++){
        console.log(i); //3
            //4
        for(let c of exampleList){
            if(c>5){ //5
                break; //6
            }
            console.log(c); //7
        }
    }
 
}
    `;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CFGVisitor8");
    expectHasEdge(cfg, 4, 8); // 4 leads to 8 if false
    expectHasEdge(cfg, 6, 8); // 6 leads to 8
    expectHasEdge(cfg, 7, 4); // 7 leads to 4
    expectHasEdge(cfg, 2, 9); // 2 leads to 9 if false
    expectHasEdge(cfg, 8, 2); // 8 leads to 2
});

/**
 * Should support a for loop containing a while loop with break/continue
 */
it("visitor v9", () => {
    let code = `
    function foo(a,b){  
             //1     //2     //9
        for(let i=0; i<a+b; i++){
            console.log(i); //3
            while(b>0){ //4
                if(i % 2 === 0){ //5
                    b--; //6
                    continue; //7
                }
                else{
                    break; //8
                }
            }
        }
        return; //10
    }
    `;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CFGVisitor9");
    expectHasEdge(cfg, 2, 10); // for loop condition false
    expectHasEdge(cfg, 7, 4); // continue goes to while condition
    expectHasEdge(cfg, 6, 7); // 6 to continue
    expectHasEdge(cfg, 8, 9); // break goes to for update
    expectHasEdge(cfg, 4, 9); // while false goes to for update
    expectHasEdge(cfg, 9, 2); // for update back to condition
});

/**
 * Should support a while loop with a nested for loop
 */
it("visitor v10", () => {
    let code = `
    function foo(x){  
        let i = 0; //1
        while(i < x){ //2
                 //3   //4   //9
            for(let j=0; j<2; j++){ 
                x--; //5
                if(j === 1){ //6
                    break; //7
                }
                console.log(j); //8
            }
            i++; //10
        }
        return; //11
    }
    `;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CFGVisitor10");
    expectHasEdge(cfg, 2, 11); // while false goes to return
    expectHasEdge(cfg, 7, 10); // break goes to i++
    expectHasEdge(cfg, 8, 9); // normal flow to update
    expectHasEdge(cfg, 10, 2); // i++ to while cond
});

/**
 * Should support a do..while loop with a nested while loop
 */
it("visitor v11", () => {
    let code = `
    function foo(x){  
        let i = 0; //1
        let j = 0; //2
        do{
            while(j < 2){ //3
                x++; //4
                j++; //5
            }
            i++; //6
        }while(i < 3) //7
        return; //8
    }
    `;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CFGVisitor11");
    expectHasEdge(cfg, 5, 3); // inner loop back
    expectHasEdge(cfg, 3, 6); // inner loop false goes to i++
    expectHasEdge(cfg, 7, 3); // outer loop back
    expectHasEdge(cfg, 7, 8); // outer loop exit
});

/**
 * Should support a for loop with a nested do..while loop
 */
it("visitor v12", () => {
    let code = `
    function foo(n){  
              //1       //2   //9  
        for(let i = 0; i < n; i++){ 
            let j = 0; //3
            do{
                j++; //4
                if(j == 2){ //5
                    continue; //6
                }
                console.log(j); //7
            }while(j < 3) //8
        }
        return; //10
    }
    `;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CFGVisitor12");
    expectHasEdge(cfg, 2, 10); // for condition false
    expectHasEdge(cfg, 6, 8); // continue goes to do..while condition
    expectHasEdge(cfg, 7, 8); // print goes to do..while condition
    expectHasEdge(cfg, 8, 9); // do..while condition to for update statement
    expectHasEdge(cfg, 8, 4); // do..while condition to 4
});

/**
 * Should support a while loop with a nested for loop
 */
it("visitor v13", () => {
    let code = `
    function foo(a){  
        let i = 0; //1
        while(i < a){ //2
                    //3     //4   //9
            for(let j = 0; j < 2; j++){ 
                console.log(j); //5
                if(j === 1){ //6
                    break; //7
                }
                a--; //8
            }
            i++; //10
        }
        return; //11
    }
    `;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CFGVisitor13");
    expectHasEdge(cfg, 2, 11); // while condition false
    expectHasEdge(cfg, 7, 10); // break goes to i++
    expectHasEdge(cfg, 8, 9); // last stmt in for goes to update
    expectHasEdge(cfg, 2, 3); // while condition to for init
    expectHasEdge(cfg, 4, 10); // for condition false to i++
});

/**
 * Should support a while loop with a nested do..while loop
 */
it("visitor v14", () => {
    let code = `
    function foo(a){  
        let i = 0; //1
        let j = 0; //2
        while(i < a){ //3
            do{
                a--; //4
                j++; //5
            }while(j < 2) //6
            i++; //7
        }
        return; //8
    }
    `;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CFGVisitor14");
    expectHasEdge(cfg, 5, 6); // loop back
    expectHasEdge(cfg, 6, 7); // do..while exit to i++
    expectHasEdge(cfg, 3, 8); // while exit to return
    expectHasEdge(cfg, 3, 4); // while entry to a--
});

/**
 * Should support a do..while loop with a nested for loop
 */
it("visitor v15", () => {
    let code = `
    function foo(a){  
        let i = 0; //1
        do{
                     //2    //3   //7
            for(let j = 0; j < 2; j++){ 
                console.log(j); //4
                if(j === 1){ //5
                    break; //6
                }
            }
            i++; //8
        }while(i < a) //9
        return; //10
    }
    `;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CFGVisitor15");
    expectHasEdge(cfg, 3, 8); // for condition false to i++
    expectHasEdge(cfg, 6, 8); // break to i++
    expectHasEdge(cfg, 9, 2); // loop back to for
    expectHasEdge(cfg, 9, 10); // exit
});

/**
 * Should support a do..while loop with a nested while loop
 */
it("visitor v16", () => {
    let code = `
    function foo(a){  
        let i = 0; //1
        let j = 0; //2
        do{
            while(j < 2){ //3
                a++; //4
                j++; //5
            }
            i++; //6
        }while(i < a) //7
        return; //8
    }
    `;
    let functionObj = parse(code);
    let cfg = CFGGenerator.generateCfg2(functionObj);
    showCFG(cfg, "CFGVisitor16");
    expectHasEdge(cfg, 5, 3); // while back edge
    expectHasEdge(cfg, 3, 6); // while exit to i++
    expectHasEdge(cfg, 7, 3); // do..while loop back
    expectHasEdge(cfg, 7, 8); // do..while loop exit
});
