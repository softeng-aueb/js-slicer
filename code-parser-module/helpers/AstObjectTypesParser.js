const VAR_TYPES = require("../constants/varTypes");
const AST_OBJECT_TYPES = require("../constants/astObjectTypes");
const GENERAL = require("../constants/general");
const Identifier = require("../domain/Identifier");
const BinaryExpression = require("../domain/BinaryExpression");
const VariableDeclaration = require("../domain/VariableDeclaration");
const ReturnStatement = require("../domain/ReturnStatement");
const ConditionalStatement = require("../domain/ConditionalStatement");
const Literal = require("../domain/Literal");
const LoopStatement = require("../domain/LoopStatement");
const AssignmentStatement = require("../domain/AssignmentStatement");
const Alternate = require("../domain/Alternate");

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
            left = this.literalParser(binaryExpressionAstObj.left);
        }else if (binaryExpressionAstObj.left && binaryExpressionAstObj.left.type === AST_OBJECT_TYPES.BINARY_EXPRESSION){
            left = this.binaryExpressionParser(binaryExpressionAstObj.left);
        }

        //TODO:Add more cases
        if (binaryExpressionAstObj.right && binaryExpressionAstObj.right.type === AST_OBJECT_TYPES.IDENTIFIER) {
            right = this.identifierParser(binaryExpressionAstObj.right);
        }else if (binaryExpressionAstObj.right && binaryExpressionAstObj.right.type === AST_OBJECT_TYPES.LITERAL){
            right = this.literalParser(binaryExpressionAstObj.right);
        }else if (binaryExpressionAstObj.right && binaryExpressionAstObj.right.type === AST_OBJECT_TYPES.BINARY_EXPRESSION){
            right = this.binaryExpressionParser(binaryExpressionAstObj.right);
        }

        return new BinaryExpression(left, right, operator)

    }

    static assignmentExpression(assignmentExpressionAstObj) {
        if (!assignmentExpressionAstObj || assignmentExpressionAstObj.type !== AST_OBJECT_TYPES.ASSIGNMENT_EXPRESSION) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.ASSIGNMENT_EXPRESSION} object.`)
        }
        let operator = assignmentExpressionAstObj.operator
        let left;
        let right;

        //TODO:Add more cases
        if (assignmentExpressionAstObj.left && assignmentExpressionAstObj.left.type === AST_OBJECT_TYPES.IDENTIFIER) {
            left = this.identifierParser(assignmentExpressionAstObj.left)
        }else if (assignmentExpressionAstObj.left && assignmentExpressionAstObj.left.type === AST_OBJECT_TYPES.LITERAL){
            left = this.literalParser(assignmentExpressionAstObj.left);
        }else if (assignmentExpressionAstObj.left && assignmentExpressionAstObj.left.type === AST_OBJECT_TYPES.BINARY_EXPRESSION){
            left = this.binaryExpressionParser(assignmentExpressionAstObj.left);
        }

        //TODO:Add more cases
        if (assignmentExpressionAstObj.right && assignmentExpressionAstObj.right.type === AST_OBJECT_TYPES.IDENTIFIER) {
            right = this.identifierParser(assignmentExpressionAstObj.right);
        }else if (assignmentExpressionAstObj.right && assignmentExpressionAstObj.right.type === AST_OBJECT_TYPES.LITERAL){
            right = this.literalParser(assignmentExpressionAstObj.right);
        }else if (assignmentExpressionAstObj.right && assignmentExpressionAstObj.right.type === AST_OBJECT_TYPES.BINARY_EXPRESSION){
            right = this.binaryExpressionParser(assignmentExpressionAstObj.right);
        }

        return new AssignmentStatement(left, right, operator)

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
        return blockStatementAstObj.body.flatMap(statement => {
            if (statement.type === AST_OBJECT_TYPES.VARIABLE_DECLARATION) {
                return this.variableDeclarationsParser(statement);
            } else if (statement.type === AST_OBJECT_TYPES.RETURN_STATEMENT) {
                return this.returnStatementParser(statement);
            } else if (statement.type === AST_OBJECT_TYPES.IF_STATEMENT) {
                return this.ifStatementParser(statement);
            }else if (statement.type === AST_OBJECT_TYPES.FOR_STATEMENT || statement.type === AST_OBJECT_TYPES.WHILE_STATEMENT) {
                return this.loopStatementParser(statement);
            } else if (statement.type === AST_OBJECT_TYPES.EXPRESSION_STATEMENT
                && statement.expression
                && statement.expression.type
                && statement.expression.type === AST_OBJECT_TYPES.ASSIGNMENT_EXPRESSION) {

                return this.assignmentExpression(statement.expression);
            }
        });
    }

    static ifStatementParser(ifStatementObj) {
        if (!ifStatementObj || (ifStatementObj.type !== AST_OBJECT_TYPES.IF_STATEMENT && ifStatementObj.type !== AST_OBJECT_TYPES.BLOCK_STATEMENT)) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.IF_STATEMENT} or  ${AST_OBJECT_TYPES.BLOCK_STATEMENT} object.`)
        }

        let condition;
        let body;
        let alternates;
        //TODO:Add more cases;
        if(ifStatementObj.test && ifStatementObj.test.type && ifStatementObj.test.type === AST_OBJECT_TYPES.BINARY_EXPRESSION){
            condition = this.binaryExpressionParser(ifStatementObj.test);
        }

        if(ifStatementObj.consequent && ifStatementObj.consequent.type && ifStatementObj.consequent.type === AST_OBJECT_TYPES.BLOCK_STATEMENT){
            body = this.blockStatementParser(ifStatementObj.consequent);
        }

        if(ifStatementObj.alternate){
            alternates = this.alternateStatementParser(ifStatementObj.alternate,[]);
        }

        return new ConditionalStatement(condition, body,alternates);
    }

    static alternateStatementParser(alternateStatementObj,alternatesArr) {
        if (!alternateStatementObj || (alternateStatementObj.type !== AST_OBJECT_TYPES.IF_STATEMENT && alternateStatementObj.type !== AST_OBJECT_TYPES.BLOCK_STATEMENT)) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.IF_STATEMENT} or  ${AST_OBJECT_TYPES.BLOCK_STATEMENT} object.`)
        }

        let condition;
        let body;

        //TODO:Add more cases;
        if(alternateStatementObj.test && alternateStatementObj.test.type && alternateStatementObj.test.type === AST_OBJECT_TYPES.BINARY_EXPRESSION){
            condition = this.binaryExpressionParser(alternateStatementObj.test);
        }

        if(alternateStatementObj.consequent && alternateStatementObj.consequent.type && alternateStatementObj.consequent.type === AST_OBJECT_TYPES.BLOCK_STATEMENT){
            body = this.blockStatementParser(alternateStatementObj.consequent);
        }

        alternatesArr.push(new Alternate(condition, body))

        if(alternateStatementObj.alternate && alternateStatementObj.alternate.type && alternateStatementObj.alternate.type === AST_OBJECT_TYPES.IF_STATEMENT){
            alternatesArr.concat(this.alternateStatementParser(alternateStatementObj.alternate, alternatesArr))
        }else if(alternateStatementObj.alternate && alternateStatementObj.alternate.type && alternateStatementObj.alternate.type === AST_OBJECT_TYPES.BLOCK_STATEMENT){
            condition = GENERAL.ELSE
            body = this.blockStatementParser(alternateStatementObj.alternate);
            alternatesArr.push(new Alternate(condition, body))
        }

        return alternatesArr;
    }

    static loopStatementParser(loopStatementAstObj) {
        if (!loopStatementAstObj || (loopStatementAstObj.type !== AST_OBJECT_TYPES.FOR_STATEMENT && loopStatementAstObj.type !== AST_OBJECT_TYPES.WHILE_STATEMENT)) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.FOR_STATEMENT} or  ${AST_OBJECT_TYPES.WHILE_STATEMENT} object.`)
        }

        let condition;
        let body;

        //TODO:Add more cases;
        if(loopStatementAstObj.test && loopStatementAstObj.test.type && loopStatementAstObj.test.type === AST_OBJECT_TYPES.BINARY_EXPRESSION){
            condition = this.binaryExpressionParser(loopStatementAstObj.test);
        }

        if(loopStatementAstObj.body && loopStatementAstObj.body.type && loopStatementAstObj.body.type === AST_OBJECT_TYPES.BLOCK_STATEMENT){
            body = this.blockStatementParser(loopStatementAstObj.body);
        }
       return new LoopStatement(loopStatementAstObj.type,condition,body)
    }
}

module.exports = AstObjectTypesParser;