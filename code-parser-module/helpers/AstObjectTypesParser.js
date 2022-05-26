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
const _ = require("lodash");
const LogicalExpression = require("../domain/LogicalExpression");
const FunctionObj = require("../domain/FunctionObj");

class AstObjectTypesParser {

    static expressionParser(expressionAstObj) {
        if(!expressionAstObj){
            throw new Error("Missing required param.")
        }

        //TODO: Add more cases
        if (expressionAstObj.type === AST_OBJECT_TYPES.BINARY_EXPRESSION) {
            return  this.binaryExpressionParser(expressionAstObj)
        }else if(expressionAstObj.type === AST_OBJECT_TYPES.CONDITIONAL_EXPRESSION){
            return this.conditionalStatementParser(expressionAstObj)
        }else if(expressionAstObj.type === AST_OBJECT_TYPES.LOGICAL_EXPRESSION){
            return this.logicalExpressionParser(expressionAstObj)
        }else if(expressionAstObj.type === AST_OBJECT_TYPES.IDENTIFIER){
            return this.identifierParser(expressionAstObj)
        }else if(expressionAstObj.type === AST_OBJECT_TYPES.LITERAL){
            return this.literalParser(expressionAstObj)
        }else if(expressionAstObj.type === AST_OBJECT_TYPES.CALL_EXPRESSION){
            return this.callExpressionParser(expressionAstObj)
        }
    }

    static variableDeclarationsParser(variableDeclarationAstObj) {
        if (!variableDeclarationAstObj || variableDeclarationAstObj.type !== AST_OBJECT_TYPES.VARIABLE_DECLARATION) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.VARIABLE_DECLARATION} object.`)
        }

        let kind = variableDeclarationAstObj.kind;

        let varNames = _.map(variableDeclarationAstObj.declarations, function (value){
           return value.id && value.id.name;
        });

        let value = this.expressionParser(variableDeclarationAstObj.declarations.find(val => val.init).init);

        return new VariableDeclaration(kind, varNames, value)
    }

    static callExpressionParser(callExpressionAstObj) {
        if (!callExpressionAstObj || callExpressionAstObj.type !== AST_OBJECT_TYPES.CALL_EXPRESSION) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.CALL_EXPRESSION} object.`)
        }

        let callee = this.expressionParser(callExpressionAstObj.callee);
        let args = callExpressionAstObj.arguments.map(arg => {
            return this.expressionParser(arg);
        });
        return new FunctionObj(callee, args)

    }

    static logicalExpressionParser(logicalExpressionAstObj) {
        if (!logicalExpressionAstObj || logicalExpressionAstObj.type !== AST_OBJECT_TYPES.LOGICAL_EXPRESSION) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.LOGICAL_EXPRESSION} object.`)
        }
        let operator = logicalExpressionAstObj.operator
        let left;
        let right;

        //TODO:Add more cases
        if (logicalExpressionAstObj.left && logicalExpressionAstObj.left.type === AST_OBJECT_TYPES.IDENTIFIER) {
            left = this.identifierParser(logicalExpressionAstObj.left)
        }else if (logicalExpressionAstObj.left && logicalExpressionAstObj.left.type === AST_OBJECT_TYPES.LITERAL){
            left = this.literalParser(logicalExpressionAstObj.left);
        }else if (logicalExpressionAstObj.left && logicalExpressionAstObj.left.type === AST_OBJECT_TYPES.LOGICAL_EXPRESSION){
            left = this.logicalExpressionParser(logicalExpressionAstObj.left);
        }

        //TODO:Add more cases
        if (logicalExpressionAstObj.right && logicalExpressionAstObj.right.type === AST_OBJECT_TYPES.IDENTIFIER) {
            right = this.identifierParser(logicalExpressionAstObj.right);
        }else if (logicalExpressionAstObj.right && logicalExpressionAstObj.right.type === AST_OBJECT_TYPES.LITERAL){
            right = this.literalParser(logicalExpressionAstObj.right);
        }else if (logicalExpressionAstObj.right && logicalExpressionAstObj.right.type === AST_OBJECT_TYPES.LOGICAL_EXPRESSION){
            right = this.logicalExpressionParser(logicalExpressionAstObj.right);
        }

        return new LogicalExpression(left, right, operator)

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
                return this.conditionalStatementParser(statement);
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

    static conditionalStatementParser(conditionalStatementObj) {
        if (!conditionalStatementObj || (conditionalStatementObj.type !== AST_OBJECT_TYPES.IF_STATEMENT
            && conditionalStatementObj.type !== AST_OBJECT_TYPES.BLOCK_STATEMENT
            && conditionalStatementObj.type !== AST_OBJECT_TYPES.CONDITIONAL_EXPRESSION)) {

            throw new Error(`Not a ${AST_OBJECT_TYPES.IF_STATEMENT} or  ${AST_OBJECT_TYPES.BLOCK_STATEMENT} or  ${AST_OBJECT_TYPES.CONDITIONAL_EXPRESSION} object.`)
        }

        let condition = this.expressionParser(conditionalStatementObj.test);
        let then = this.expressionParser(conditionalStatementObj.consequent);
        let alternates = this.expressionParser(conditionalStatementObj.alternate);

        return new ConditionalStatement(condition, then, alternates);
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