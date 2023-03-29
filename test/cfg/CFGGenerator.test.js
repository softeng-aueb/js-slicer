
const Parser = require('../../code-parser-module/Parser.js');
const FUNCTION_TYPES = require('../../code-parser-module/constants/functionTypes')
const CFGGenerator = require('../../control-flow-graph/CFGGenerator')

function expectHasEdge(cfg, source, target){
    expect(cfg.hasEdge(source, target)).toBe(true)
}

it('should support break from nested loops', () => {
    let code = `
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
    }`
    let functionObj = parse(code)
    let cfg = CFGGenerator.generateCfg2(functionObj)
    cfg.print()
    expect(cfg.nodes.length).toBe(15)
    expectHasEdge(cfg, 3, 15) // outer loop exit
    expectHasEdge(cfg, 5, 15) // outer loop break flow
    expectHasEdge(cfg, 14, 3) // outer loop update flow
    expectHasEdge(cfg, 10, 14) // inner loop first break
    expectHasEdge(cfg, 12, 14) // inner loop second break
    expectHasEdge(cfg, 7, 14) // inner loop exit to outer update
    expectHasEdge(cfg, 13, 7) // inner loop update flow
    
})


it('should support break statements', () => {
    let code = `
    function foo(a, b){
        let ar = [1, 2, 3]
        for(let i = 0; i < ar.length; i++){
            if (ar[i] % 2 == 0){
                break;
            }
        }
        return 0
    }`
    let functionObj = parse(code)
    let cfg = CFGGenerator.generateCfg2(functionObj)
    cfg.print()
    expect(cfg.nodes.length).toBe(7)
    expectHasEdge(cfg, 2, 3) 
    expectHasEdge(cfg, 3, 4) 
    expectHasEdge(cfg, 5, 7) // break control flow
    expectHasEdge(cfg, 6, 3) // update to condition flow 
})

it('should handle multiple returns', () => {
    let code = `
    function foo(a, b){
        let ar = [1, 2, 3]
        if (a > b){
            return a
        }
        if (a > 2*b){
            return b
        }
        return a + b + ar[a]
    }`
    let functionObj = parse(code)
    let cfg = CFGGenerator.generateCfg2(functionObj)
    cfg.print()
    expect(cfg.nodes.length).toBe(6)
    expectHasEdge(cfg, 2, 4) 
    expect(cfg.getNodeById(3).isReturnStatement())
    expect(cfg.getNodeById(5).isReturnStatement())
    expect(cfg.getNodeById(6).isReturnStatement())
})

it('should generate cfg for for statements', () => {
    let code = `
    function foo(){
        let ar = [1, 2, 3]
        let a = 1
        for(let i = 0; i < 10; i++){
            a = a + i
            if (a > 10){
                console.log(a)
            }
        }
        return a + b
    }`
    let functionObj = parse(code)
    let cfg = CFGGenerator.generateCfg2(functionObj)
    cfg.print()
    expect(cfg.nodes.length).toBe(9)
    expectHasEdge(cfg, 3, 4) // init to condition   
    expectHasEdge(cfg, 4, 5) // condition to body or next stmt
    expectHasEdge(cfg, 4, 9)
    expectHasEdge(cfg, 8, 4) // update to condition
})

it('should generate cfg for nested while statements', () => {
    let code = `
    function foo(){
        let ar = [1, 2, 3]
        let a = 1
        while(a < ar.length){
            var b = 2
            a = a + 1
            while(b >= 0){
                b--
                if(b < 0){
                    b = -10
                }
            }
        }
        return a + b
    }`
    let functionObj = parse(code)
    let cfg = CFGGenerator.generateCfg2(functionObj)
    cfg.print()
    expect(cfg.nodes.length).toBe(10)
    expectHasEdge(cfg, 3, 4)
    expectHasEdge(cfg, 4, 5)
    expectHasEdge(cfg, 3, 10)
    expectHasEdge(cfg, 6, 7)
    expectHasEdge(cfg, 6, 3)
    expectHasEdge(cfg, 8, 6)
    expectHasEdge(cfg, 9, 6)
    // expectHasEdge(cfg, 7, 3)
    // expectHasEdge(cfg, 3, 8)
});


it('should generate cfg for while statements', () => {
    let code = `
    function foo(){
        let ar = [1, 2, 3]
        let a = 1
        while(a < ar.length){
            var b = 2
            console.log(a)    
            if (b < 1){
                console.log(b)
            }
        }
        return a + b
    }`
    let functionObj = parse(code)
    let cfg = CFGGenerator.generateCfg2(functionObj)
    cfg.print()
    expect(cfg.nodes.length).toBe(8)
    expectHasEdge(cfg, 3, 4)
    expectHasEdge(cfg, 6, 3)
    expectHasEdge(cfg, 7, 3)
    expectHasEdge(cfg, 3, 8)
});

it('should generate cfg for nested if statements', () => {
    let code = `
    function foo(){
        let ar = [1, 2, 3]
        let a = 1
        if (a > 1){
            var b = 2
            console.log(a)    
            if (b < 1){
                console.log(b)
            }
        }
        return a + b
    }`
    let functionObj = parse(code)
    let cfg = CFGGenerator.generateCfg2(functionObj)
    cfg.print()
    expect(cfg.nodes.length).toBe(8)
    expectHasEdge(cfg, 3, 4)
    expectHasEdge(cfg, 5, 6)
    expectHasEdge(cfg, 6, 7)
    expectHasEdge(cfg, 7, 8)
    expectHasEdge(cfg, 3, 8)
    expectHasEdge(cfg, 6, 8)
    
    
})

it('should generate cfg for if else if', () => {
    let code = `
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
            }
        } else {
            var c = 1
            console.log(c)
        }
        return a + b
    }`
    let functionObj = parse(code)
    let cfg = CFGGenerator.generateCfg2(functionObj)
    cfg.print()
    expect(cfg.nodes.length).toBe(14)
    expectHasEdge(cfg, 3, 4)
    expectHasEdge(cfg, 3, 7)
    expectHasEdge(cfg, 7, 12)
    expectHasEdge(cfg, 6, 14)
    expectHasEdge(cfg, 13, 14)
    expectHasEdge(cfg, 11, 14)

})

it('should generate cfg for if then else', () => {
    let code = `
    function foo(){
        let ar = [1, 2, 3]
        let a = 1
        if (a > 1){
            var b = 2
            a = b + a
            console.log(a)    
        } else {
            var c = ar[0] + a
            a = a + c
            console.log(c)
        }
        return a + b
    }`
    let functionObj = parse(code)
    let cfg = CFGGenerator.generateCfg2(functionObj)
    cfg.print()
    expect(cfg.nodes.length).toBe(10)
    expectHasEdge(cfg, 3, 4)
    expectHasEdge(cfg, 3, 7)
    expectHasEdge(cfg, 6, 10)
    expectHasEdge(cfg, 9, 10)
})

it('should generate cfg for sequential statements', () => {
    let code = `
    function foo(){
        let i = 0
        let ar = [1, i++, 3]
        let a = 1
        let b = 2
        console.log(a)
        return a + b
    }
    `
    let functionObj = parse(code)
    let cfg = CFGGenerator.generateCfg2(functionObj)
    expect(cfg.nodes.length).toBe(7)
    expect(cfg.getNodeById(2).hasStatementType('UpdateExpression')).toBe(true)
    expect(cfg.hasEdge(1, 2)).toBe(true)
    expect(cfg.hasEdge(2, 3)).toBe(true)
    expect(cfg.hasEdge(3, 4)).toBe(true)
    expect(cfg.hasEdge(4, 5)).toBe(true)
    expect(cfg.hasEdge(5, 6)).toBe(true)
    expect(cfg.hasEdge(6, 7)).toBe(true)
    cfg.print()
    //console.log(cfg)
})





/*
it('should parse for statements', () => {
    let code = `
        function foo(){
            let ar = [1, 2, 3]
            for(let i = 0; i < ar.length; i++){
                console.log(i)
            }
            return ar
        }
    `
    let functionObj = parse(code)
    let cfg = CFGGenerator.generateCfg2(functionObj)
    console.log(cfg)
    
})*/

/*
it('should parse function contents', () => {
    let code = `
    function foo(a, b){
        bar(z)
        let i = 0
        if (i > 10){
            console.log('>')
        } else if (i < 10) {
            console.log('<')
        } else {
            console.log('=')
        }
        return a + b;
    }
    `;
    let functionObj = parse(code)
    expect(functionObj.name).toBe('foo')
    expect(functionObj.args.map(arg => arg.name))
        .toEqual(expect.arrayContaining(['a', 'b']))
    expect(functionObj.type).toBe(FUNCTION_TYPES.SYNC)
    expect(functionObj.body.length).toBe(4)

})
*/
function parse(str){
    return Parser.parse(str.split('\n'));
}
