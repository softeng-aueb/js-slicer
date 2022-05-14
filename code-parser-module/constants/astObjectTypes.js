const AST_OBJECT_TYPES = {
    FUNCTION_DECLARATION: "FunctionDeclaration",
    VARIABLE_DECLARATION: "VariableDeclaration",
    RETURN_STATEMENT:"ReturnStatement",
    BINARY_EXPRESSION:"BinaryExpression",
    IDENTIFIER:"Identifier"
}

module.exports = Object.freeze(AST_OBJECT_TYPES)