
const Parser = require('../../code-parser-module/Parser.js');
const FUNCTION_TYPES = require('../../code-parser-module/constants/functionTypes')
const CFGGenerator = require('../../control-flow-graph/CFGGenerator')


it('should generate cfg for sequential statements', () => {
    let code = `
    function foo(){
        let ar = [1, 2, 3]
        let a = 1
        let b = 2
    }
    `
    let functionObj = parse(code)
    let cfg = CFGGenerator.generateCfg2(functionObj)
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
