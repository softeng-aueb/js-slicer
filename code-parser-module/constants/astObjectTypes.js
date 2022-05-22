const AST_OBJECT_TYPES = {
    FUNCTION_DECLARATION: "FunctionDeclaration",
    VARIABLE_DECLARATION: "VariableDeclaration",
    RETURN_STATEMENT:"ReturnStatement",
    BINARY_EXPRESSION:"BinaryExpression",
    IDENTIFIER:"Identifier",
    EXPRESSION_STATEMENT:"ExpressionStatement",
    ARROW_FUNCTION_EXPRESSION:"ArrowFunctionExpression",
    IF_STATEMENT: "IfStatement",
    BLOCK_STATEMENT : "BlockStatement",
    LITERAL:"Literal",
    FOR_STATEMENT:"ForStatement",
    WHILE_STATEMENT:"WhileStatement",
    ASSIGNMENT_EXPRESSION : "AssignmentExpression"

}

module.exports = Object.freeze(AST_OBJECT_TYPES)