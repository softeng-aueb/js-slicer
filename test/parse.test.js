const { parse, print } = require("recast");
var source = [
    "let a = 1",
    "let b = 2 * 3 + a",
    "function add(a, b) {",
    "  return a +",
    "    // Weird formatting, huh?",
    "    b;",
    "}",
    "let c = add(a, b)",
    "console.log(c)"
].join("\n");

test('basic parsing', () => {
    let ast = parse(source);
    console.log(ast.program.body)
})