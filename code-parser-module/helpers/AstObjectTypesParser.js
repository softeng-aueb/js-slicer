const VAR_TYPES = require("../constants/varTypes");
const AST_OBJECT_TYPES = require("../constants/astObjectTypes");
const Identifier = require("../domain/Identifier");
const BinaryExpression = require("../domain/BinaryExpression");
const VariableDeclaration = require("../domain/VariableDeclaration");
const ReturnStatement = require("../domain/ReturnStatement");
const ConditionalStatement = require("../domain/ConditionalStatement");
const Literal = require("../domain/Literal");

class AstObjectTypesParser {

    static variableDeclarationsParser(variableDeclarationAstObj) {
        if (!variableDeclarationAstObj || variableDeclarationAstObj.type !== AST_OBJECT_TYPES.VARIABLE_DECLARATION) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.VARIABLE_DECLARATION} object.`)
        }

        let kind = variableDeclarationAstObj.kind || VAR_TYPES.LET;
        let varName = variableDeclarationAstObj.declarations
            && variableDeclarationAstObj.declarations[0]
            && variableDeclarationAstObj.declarations[0].id
            && variableDeclarationAstObj.declarations[0].id.name
        let value;

        //TODO: Add more cases
        if (variableDeclarationAstObj.declarations
            && variableDeclarationAstObj.declarations[0]
            && variableDeclarationAstObj.declarations[0].init
            && variableDeclarationAstObj.declarations[0].init.type === AST_OBJECT_TYPES.BINARY_EXPRESSION) {

            value = this.binaryExpressionParser(variableDeclarationAstObj.declarations[0].init)
        }

        return new VariableDeclaration(kind, varName, value)
    }

    static binaryExpressionParser(binaryExpressionAstObj) {
        if (!binaryExpressionAstObj || binaryExpressionAstObj.type !== AST_OBJECT_TYPES.BINARY_EXPRESSION) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.BINARY_EXPRESSION} object.`)
        }
        let operator = binaryExpressionAstObj.operator
        let left;
        let right;

        //TODO:Add more cases
        if (binaryExpressionAstObj.left && binaryExpressionAstObj.left.type === AST_OBJECT_TYPES.IDENTIFIER) {
            left = this.identifierParser(binaryExpressionAstObj.left)
        }else if (binaryExpressionAstObj.left && binaryExpressionAstObj.left.type === AST_OBJECT_TYPES.LITERAL){
            right = this.literalParser(binaryExpressionAstObj.left);
        }

        //TODO:Add more cases
        if (binaryExpressionAstObj.right && binaryExpressionAstObj.right.type === AST_OBJECT_TYPES.IDENTIFIER) {
            right = this.identifierParser(binaryExpressionAstObj.right);
        }else if (binaryExpressionAstObj.right && binaryExpressionAstObj.right.type === AST_OBJECT_TYPES.LITERAL){
            right = this.literalParser(binaryExpressionAstObj.right);
        }

        return new BinaryExpression(left, right, operator)

    }

    static identifierParser(identifierAstObj) {
        if (!identifierAstObj || identifierAstObj.type !== AST_OBJECT_TYPES.IDENTIFIER) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.IDENTIFIER} object.`)
        }
        return new Identifier(identifierAstObj.name)

    }

    static literalParser(literalAstObj) {
        if (!literalAstObj || literalAstObj.type !== AST_OBJECT_TYPES.LITERAL) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.LITERAL} object.`)
        }
        return new Literal(literalAstObj.value)

    }

    static returnStatementParser(returnStatementAstObj) {
        if (!returnStatementAstObj || returnStatementAstObj.type !== AST_OBJECT_TYPES.RETURN_STATEMENT) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.RETURN_STATEMENT} object.`)
        }
        let argument;
        if (returnStatementAstObj.argument && returnStatementAstObj.argument.type === AST_OBJECT_TYPES.IDENTIFIER) {
            argument = this.identifierParser(returnStatementAstObj.argument)
        }else if(returnStatementAstObj.argument && returnStatementAstObj.argument.type === AST_OBJECT_TYPES.BINARY_EXPRESSION) {
            argument = this.binaryExpressionParser(returnStatementAstObj.argument)
        }
        return new ReturnStatement(argument)

    }

    static blockStatementParser(blockStatementAstObj) {
        if (!blockStatementAstObj || blockStatementAstObj.type !== AST_OBJECT_TYPES.BLOCK_STATEMENT) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.BLOCK_STATEMENT} object.`)
        }
        return blockStatementAstObj.body.map(statement => {
            if (statement.type === AST_OBJECT_TYPES.VARIABLE_DECLARATION) {
                return this.variableDeclarationsParser(statement);
            } else if (statement.type === AST_OBJECT_TYPES.RETURN_STATEMENT) {
                return this.returnStatementParser(statement);
            } else if (statement.type === AST_OBJECT_TYPES.IF_STATEMENT) {
                return this.ifStatementParser(statement);
            }
        });
    }

    static ifStatementParser(ifStatementObj) {
        if (!ifStatementObj || ifStatementObj.type !== AST_OBJECT_TYPES.IF_STATEMENT) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.IF_STATEMENT} object.`)
        }

        let condition;
        let body;

        //TODO:Add more cases;
        if(ifStatementObj.test && ifStatementObj.test.type && ifStatementObj.test.type === AST_OBJECT_TYPES.BINARY_EXPRESSION){
            condition = this.binaryExpressionParser(ifStatementObj.test);
        }

        if(ifStatementObj.consequent && ifStatementObj.consequent.type && ifStatementObj.consequent.type === AST_OBJECT_TYPES.BLOCK_STATEMENT){
            body = this.blockStatementParser(ifStatementObj.consequent);
        }
        return new ConditionalStatement(condition, body)
    }
}

module.exports = AstObjectTypesParser;