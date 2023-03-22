
const Parser = require('../../code-parser-module/Parser.js');
const FUNCTION_TYPES = require('../../code-parser-module/constants/functionTypes')

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
    let forStmt = functionObj.body[1]
    expect(forStmt.type).toBe('ForStatement')
    expect(forStmt.init.names[0]).toBe('i')
    expect(forStmt.updateVar).toBe('i')

    //console.log(forStmt.update)
    expect(forStmt.constructor.name).toBe('ForStatement');
    expect(forStmt.condition.constructor.name).toBe('BinaryExpression')


})

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

function parse(str){
    return Parser.parse(str.split('\n'));
}
