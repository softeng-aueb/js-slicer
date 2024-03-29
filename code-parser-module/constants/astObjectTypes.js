const AST_OBJECT_TYPES = {
    ARRAY_EXPRESSION: "ArrayExpression",
    ARROW_FUNCTION_EXPRESSION:"ArrowFunctionExpression",
    ASSIGNMENT_EXPRESSION : "AssignmentExpression",
    BINARY_EXPRESSION:"BinaryExpression",
    BREAK_STATEMENT: "BreakStatement",
    BLOCK_STATEMENT : "BlockStatement",
    CALL_EXPRESSION : "CallExpression",
    CONDITIONAL_EXPRESSION : "ConditionalExpression",
    EXPRESSION_STATEMENT:"ExpressionStatement",
    FOR_STATEMENT:"ForStatement",
    FUNCTION_DECLARATION: "FunctionDeclaration",
    IDENTIFIER:"Identifier",
    IF_STATEMENT: "IfStatement",
    LITERAL:"Literal",
    LOGICAL_EXPRESSION : "LogicalExpression",
    MEMBER_EXPRESSION:"MemberExpression",
    OBJECT_EXPRESSION:"ObjectExpression",
    RETURN_STATEMENT:"ReturnStatement",
    WHILE_STATEMENT:"WhileStatement",
    UNARY_EXPRESSION:"UnaryExpression",
    UPDATE_EXPRESSION: "UpdateExpression",
    VARIABLE_DECLARATION: "VariableDeclaration"
}

module.exports = Object.freeze(AST_OBJECT_TYPES)