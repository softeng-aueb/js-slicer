const AST_OBJECT_TYPES = {
    ARRAY_EXPRESSION: "ArrayExpression",
    FUNCTION_DECLARATION: "FunctionDeclaration",
    VARIABLE_DECLARATION: "VariableDeclaration",
    RETURN_STATEMENT:"ReturnStatement",
    UNARY_EXPRESSION:"UnaryExpression",
    BINARY_EXPRESSION:"BinaryExpression",
    IDENTIFIER:"Identifier",
    EXPRESSION_STATEMENT:"ExpressionStatement",
    ARROW_FUNCTION_EXPRESSION:"ArrowFunctionExpression",
    IF_STATEMENT: "IfStatement",
    BLOCK_STATEMENT : "BlockStatement",
    LITERAL:"Literal",
    FOR_STATEMENT:"ForStatement",
    WHILE_STATEMENT:"WhileStatement",
    ASSIGNMENT_EXPRESSION : "AssignmentExpression",
    CONDITIONAL_EXPRESSION : "ConditionalExpression",
    LOGICAL_EXPRESSION : "LogicalExpression",
    CALL_EXPRESSION : "CallExpression",
    OBJECT_EXPRESSION:"ObjectExpression",
    MEMBER_EXPRESSION:"MemberExpression",
    UPDATE_EXPRESSION: "UpdateExpression"

}

module.exports = Object.freeze(AST_OBJECT_TYPES)