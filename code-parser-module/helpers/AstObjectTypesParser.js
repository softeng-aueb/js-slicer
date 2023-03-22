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
const FunctionCall = require("../domain/FunctionCall");
const ObjectExpression = require("../domain/ObjectExpression");
const ObjectProperty = require("../domain/ObjectProperty");
const MemberExpression = require("../domain/MemberExpression");
const ForStatement = require("../domain/ForStatement");
const UpdateExpression = require("../domain/UpdateExpression");

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
        }else if(expressionAstObj.type === AST_OBJECT_TYPES.ASSIGNMENT_EXPRESSION){
            return this.assignmentExpressionParser(expressionAstObj)
        } else if (expressionAstObj.type ===AST_OBJECT_TYPES.UPDATE_EXPRESSION){
            return this.updateExpressionParser(expressionAstObj)
        } else if(expressionAstObj.type === AST_OBJECT_TYPES.EXPRESSION_STATEMENT){
            return this.expressionStatementParser(expressionAstObj)
        }else if(expressionAstObj.type === AST_OBJECT_TYPES.BLOCK_STATEMENT){
            return this.blockStatementParser(expressionAstObj)
        }else if(expressionAstObj.type === AST_OBJECT_TYPES.IF_STATEMENT){
            return this.ifStatementParser(expressionAstObj)
        }else if(expressionAstObj.type === AST_OBJECT_TYPES.RETURN_STATEMENT){
            return this.returnStatementParser(expressionAstObj)
        }else if(expressionAstObj.type === AST_OBJECT_TYPES.OBJECT_EXPRESSION){
            return this.objectExpressionParser(expressionAstObj)
        }else if(expressionAstObj.type === AST_OBJECT_TYPES.MEMBER_EXPRESSION){
            return this.memberExpressionParser(expressionAstObj)
        }
    }


    static memberExpressionParser(memberExpressionAstObj){
        if (!memberExpressionAstObj || memberExpressionAstObj.type !== AST_OBJECT_TYPES.MEMBER_EXPRESSION) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.MEMBER_EXPRESSION} object.`)
        }

        let object = this.expressionParser(memberExpressionAstObj.object);
        let property = this.expressionParser(memberExpressionAstObj.property);

        return new MemberExpression(object,property);
    }
    static expressionStatementParser(expressionStatementAstObj) {
        if (!expressionStatementAstObj || expressionStatementAstObj.type !== AST_OBJECT_TYPES.EXPRESSION_STATEMENT) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.EXPRESSION_STATEMENT} object.`)
        }
        return this.expressionParser(expressionStatementAstObj.expression)
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
        return new FunctionCall(callee, args)

    }
    static objectExpressionParser(objectExpressionAstObj) {
        if (!objectExpressionAstObj || objectExpressionAstObj.type !== AST_OBJECT_TYPES.OBJECT_EXPRESSION) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.OBJECT_EXPRESSION} object.`)
        }

        let properties = objectExpressionAstObj.properties.map(prop => {
            return new ObjectProperty(this.expressionParser(prop.key), this.expressionParser(prop.value))
        });

        return new ObjectExpression(properties)

    }


    static logicalExpressionParser(logicalExpressionAstObj) {
        if (!logicalExpressionAstObj || logicalExpressionAstObj.type !== AST_OBJECT_TYPES.LOGICAL_EXPRESSION) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.LOGICAL_EXPRESSION} object.`)
        }
        let operator = logicalExpressionAstObj.operator
        let left =  this.expressionParser(logicalExpressionAstObj.left);
        let right = this.expressionParser(logicalExpressionAstObj.right);

        return new LogicalExpression(left, right, operator)

    }

    static binaryExpressionParser(binaryExpressionAstObj) {
        if (!binaryExpressionAstObj || binaryExpressionAstObj.type !== AST_OBJECT_TYPES.BINARY_EXPRESSION) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.BINARY_EXPRESSION} object.`)
        }
        let operator = binaryExpressionAstObj.operator
        let left =  this.expressionParser(binaryExpressionAstObj.left);
        let right = this.expressionParser(binaryExpressionAstObj.right);

        return new BinaryExpression(left, right, operator)
    }



    static assignmentExpressionParser(assignmentExpressionAstObj) {
        if (!assignmentExpressionAstObj || assignmentExpressionAstObj.type !== AST_OBJECT_TYPES.ASSIGNMENT_EXPRESSION) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.ASSIGNMENT_EXPRESSION} object.`)
        }
        let operator = assignmentExpressionAstObj.operator
        let left =  this.expressionParser(assignmentExpressionAstObj.left);
        let right = this.expressionParser(assignmentExpressionAstObj.right);

        return new AssignmentStatement(left, right, operator)
    }

    static updateExpressionParser(updateExpressionAstObj) {
        if (!updateExpressionAstObj || updateExpressionAstObj.type !== AST_OBJECT_TYPES.UPDATE_EXPRESSION) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.UPDATE_EXPRESSION} object.`)
        }
        let operator = updateExpressionAstObj.operator
        let argument =  this.expressionParser(updateExpressionAstObj.argument);
        let prefix = updateExpressionAstObj.prefix;

        return new UpdateExpression(argument, prefix, operator)
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
        let argument = this.expressionParser(returnStatementAstObj.argument);
        return new ReturnStatement(argument)
    }

    static blockStatementParser(blockStatementAstObj) {
        if (!blockStatementAstObj || blockStatementAstObj.type !== AST_OBJECT_TYPES.BLOCK_STATEMENT) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.BLOCK_STATEMENT} object.`)
        }
        return blockStatementAstObj.body.flatMap(statement => {
            return this.expressionParser(statement);
        });
    }

    static conditionalStatementParser(conditionalStatementObj) {
        if (!conditionalStatementObj || (conditionalStatementObj.type !== AST_OBJECT_TYPES.CONDITIONAL_EXPRESSION)) {

            throw new Error(`Not a ${AST_OBJECT_TYPES.CONDITIONAL_EXPRESSION} object.`)
        }

        let condition = this.expressionParser(conditionalStatementObj.test);
        let then = this.expressionParser(conditionalStatementObj.consequent);
        let alternates = this.expressionParser(conditionalStatementObj.alternate);

        return new ConditionalStatement(condition, then, alternates);
    }

    static ifStatementParser(ifStatementObj) {
        if (!ifStatementObj || (ifStatementObj.type !== AST_OBJECT_TYPES.IF_STATEMENT)) {

            throw new Error(`Not a ${AST_OBJECT_TYPES.IF_STATEMENT} object.`)
        }

        let condition = this.expressionParser(ifStatementObj.test);


        let then = ifStatementObj.consequent.body.map(e => {
            return this.expressionParser(e);
        });

        let alternates = (ifStatementObj.alternate) ?this.expressionParser(ifStatementObj.alternate) : null;

        return new ConditionalStatement(condition, then, alternates);
    }

    static loopStatementParser(loopStatementAstObj) {
        if (!loopStatementAstObj || 
            (loopStatementAstObj.type !== AST_OBJECT_TYPES.FOR_STATEMENT 
                && loopStatementAstObj.type !== AST_OBJECT_TYPES.WHILE_STATEMENT)) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.FOR_STATEMENT} or  ${AST_OBJECT_TYPES.WHILE_STATEMENT} object.`)
        }


        let condition = this.expressionParser(loopStatementAstObj.test);
        let body =  this.expressionParser(loopStatementAstObj.body);

        if (loopStatementAstObj.type === AST_OBJECT_TYPES.FOR_STATEMENT){
            //console.log(loopStatementAstObj)
            let init = this.variableDeclarationsParser(loopStatementAstObj.init)
            let update = this.expressionParser(loopStatementAstObj.update);
            //console.log(update)
            return new ForStatement(loopStatementAstObj.type, condition, body, init, update);
        }

       return new LoopStatement(loopStatementAstObj.type,condition,body)
    }
}

module.exports = AstObjectTypesParser;