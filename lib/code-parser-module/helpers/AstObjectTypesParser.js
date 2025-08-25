const AST_OBJECT_TYPES = require("../constants/astObjectTypes");
const Identifier = require("../domain/Identifier");
const BinaryExpression = require("../domain/BinaryExpression");
const UnaryExpression = require("../domain/UnaryExpression");
const VariableDeclaration = require("../domain/VariableDeclaration");
const ReturnStatement = require("../domain/ReturnStatement");
const ConditionalStatement = require("../domain/ConditionalStatement");
const Literal = require("../domain/Literal");
const AssignmentStatement = require("../domain/AssignmentStatement");
const LogicalExpression = require("../domain/LogicalExpression");
const FunctionCall = require("../domain/FunctionCall");
const ObjectExpression = require("../domain/ObjectExpression");
const ObjectProperty = require("../domain/ObjectProperty");
const MemberExpression = require("../domain/MemberExpression");
const ForStatement = require("../domain/ForStatement");
const UpdateExpression = require("../domain/UpdateExpression");
const ArrayExpression = require("../domain/ArrayExpression");
const BreakStatement = require("../domain/BreakStatement");
const WhileStatement = require("../domain/WhileStatement");
const DoWhileStatement = require("../domain/DoWhileStatement");
const ContinueStatement = require("../domain/ContinueStatement");
const BlockStatement = require("../domain/BlockStatement");
const ForEachStatement = require("../domain/ForEachStatement");
const SwitchStatement = require("../domain/SwitchStatement");
const SwitchCase = require("../domain/SwitchCase");
const FunctionDeclaration = require("../domain/FunctionDeclaration");
const FunctionExpression = require("../domain/FunctionExpression");
const ArrowFunctionExpression = require("../domain/ArrowFunctionExpression");
const AssignmentPattern = require("../domain/AssignmentPattern");
const TemplateLiteral = require("../domain/TemplateLiteral");

class AstObjectTypesParser {
    static expressionParser(expressionAstObj) {
        if (!expressionAstObj) {
            throw new Error(`Missing required param. Was given ${expressionAstObj}`);
        }

        switch (expressionAstObj.type) {
            case AST_OBJECT_TYPES.TEMPLATE_LITERAL:
                return this.templateLiteralParser(expressionAstObj);

            case AST_OBJECT_TYPES.ASSIGNMENT_PATTERN:
                return this.assignmentPatternParser(expressionAstObj);

            case AST_OBJECT_TYPES.ARROW_FUNCTION_EXPRESSION:
                return this.arrowFunctionExpressionParser(expressionAstObj);

            case AST_OBJECT_TYPES.FUNCTION_EXPRESSION:
                return this.functionExpressionParser(expressionAstObj);

            case AST_OBJECT_TYPES.FUNCTION_DECLARATION:
                return this.functionDeclarationParser(expressionAstObj);

            case AST_OBJECT_TYPES.SWITCH_STATEMENT:
                return this.switchStatementParser(expressionAstObj);

            case AST_OBJECT_TYPES.ARRAY_EXPRESSION:
                return this.arrayExpressionParser(expressionAstObj);

            case AST_OBJECT_TYPES.BREAK_STATEMENT:
                return this.breakStatementParser(expressionAstObj);

            case AST_OBJECT_TYPES.CONTINUE_STATEMENT:
                return this.continueStatementParser(expressionAstObj);

            case AST_OBJECT_TYPES.WHILE_STATEMENT:
            case AST_OBJECT_TYPES.DO_WHILE_STATEMENT:
            case AST_OBJECT_TYPES.FOR_STATEMENT:
            case AST_OBJECT_TYPES.FOR_OF_STATEMENT:
            case AST_OBJECT_TYPES.FOR_IN_STATEMENT:
                return this.loopStatementParser(expressionAstObj);

            case AST_OBJECT_TYPES.VARIABLE_DECLARATION:
                return this.variableDeclarationsParser(expressionAstObj);

            case AST_OBJECT_TYPES.UNARY_EXPRESSION:
                return this.unaryExpressionParser(expressionAstObj);

            case AST_OBJECT_TYPES.BINARY_EXPRESSION:
                return this.binaryExpressionParser(expressionAstObj);

            case AST_OBJECT_TYPES.CONDITIONAL_EXPRESSION:
                return this.conditionalStatementParser(expressionAstObj);

            case AST_OBJECT_TYPES.LOGICAL_EXPRESSION:
                return this.logicalExpressionParser(expressionAstObj);

            case AST_OBJECT_TYPES.IDENTIFIER:
                return this.identifierParser(expressionAstObj);

            case AST_OBJECT_TYPES.LITERAL:
                return this.literalParser(expressionAstObj);

            case AST_OBJECT_TYPES.CALL_EXPRESSION:
                return this.callExpressionParser(expressionAstObj);

            case AST_OBJECT_TYPES.ASSIGNMENT_EXPRESSION:
                return this.assignmentExpressionParser(expressionAstObj);

            case AST_OBJECT_TYPES.UPDATE_EXPRESSION:
                return this.updateExpressionParser(expressionAstObj);

            case AST_OBJECT_TYPES.EXPRESSION_STATEMENT:
                return this.expressionStatementParser(expressionAstObj);

            case AST_OBJECT_TYPES.BLOCK_STATEMENT:
                return this.blockStatementParser(expressionAstObj);

            case AST_OBJECT_TYPES.IF_STATEMENT:
                return this.ifStatementParser(expressionAstObj);

            case AST_OBJECT_TYPES.RETURN_STATEMENT:
                return this.returnStatementParser(expressionAstObj);

            case AST_OBJECT_TYPES.OBJECT_EXPRESSION:
                return this.objectExpressionParser(expressionAstObj);

            case AST_OBJECT_TYPES.MEMBER_EXPRESSION:
                return this.memberExpressionParser(expressionAstObj);

            default:
                throw new Error(`Unsupported AST node type: ${expressionAstObj.type}`);
        }
    }

    static switchStatementParser(switchStatementAstObj) {
        if (!switchStatementAstObj || switchStatementAstObj.type !== AST_OBJECT_TYPES.SWITCH_STATEMENT)
            throw new Error(`Not a ${AST_OBJECT_TYPES.SWITCH_STATEMENT} object.`);

        let discriminant = this.expressionParser(switchStatementAstObj.discriminant);
        discriminant.uniqueText = `switch(${discriminant.name})`;
        let cases = switchStatementAstObj.cases.flatMap((statement) => {
            return this.switchCaseParser(statement, switchStatementAstObj.discriminant);
        });

        return new SwitchStatement(discriminant, cases);
    }

    static switchCaseParser(switchCaseAstObj, discriminant) {
        if (!switchCaseAstObj || switchCaseAstObj.type !== AST_OBJECT_TYPES.SWITCH_CASE)
            throw new Error(`Not a ${AST_OBJECT_TYPES.SWITCH_CASE} object.`);

        let test =
            switchCaseAstObj.test !== null
                ? this.expressionParser({
                      type: AST_OBJECT_TYPES.BINARY_EXPRESSION,
                      left: discriminant,
                      right: switchCaseAstObj.test,
                      operator: "===",
                  })
                : null;
        let consequent = { type: AST_OBJECT_TYPES.BLOCK_STATEMENT, body: switchCaseAstObj.consequent };

        consequent = this.blockStatementParser(consequent);

        return new SwitchCase(test, consequent);
    }

    static memberExpressionParser(memberExpressionAstObj) {
        if (!memberExpressionAstObj || memberExpressionAstObj.type !== AST_OBJECT_TYPES.MEMBER_EXPRESSION) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.MEMBER_EXPRESSION} object.`);
        }

        let object = this.expressionParser(memberExpressionAstObj.object);
        let property = this.expressionParser(memberExpressionAstObj.property);

        return new MemberExpression(object, property);
    }
    static expressionStatementParser(expressionStatementAstObj) {
        if (!expressionStatementAstObj || expressionStatementAstObj.type !== AST_OBJECT_TYPES.EXPRESSION_STATEMENT) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.EXPRESSION_STATEMENT} object.`);
        }
        return this.expressionParser(expressionStatementAstObj.expression);
    }

    static variableDeclarationsParser(variableDeclarationAstObj) {
        if (!variableDeclarationAstObj || variableDeclarationAstObj.type !== AST_OBJECT_TYPES.VARIABLE_DECLARATION) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.VARIABLE_DECLARATION} object.`);
        }

        let kind = variableDeclarationAstObj.kind;

        let varNames = variableDeclarationAstObj.declarations.map((d) => AstObjectTypesParser.expressionParser(d.id));

        let values = variableDeclarationAstObj.declarations.map((d) =>
            d.init === undefined ? undefined : d.init === null ? null : AstObjectTypesParser.expressionParser(d.init)
        );

        return new VariableDeclaration(kind, varNames, values);
    }

    static callExpressionParser(callExpressionAstObj) {
        if (!callExpressionAstObj || callExpressionAstObj.type !== AST_OBJECT_TYPES.CALL_EXPRESSION) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.CALL_EXPRESSION} object.`);
        }

        let callee = this.expressionParser(callExpressionAstObj.callee);
        let args = callExpressionAstObj.arguments.map((arg) => {
            return this.expressionParser(arg);
        });
        return new FunctionCall(callee, args);
    }
    static objectExpressionParser(objectExpressionAstObj) {
        if (!objectExpressionAstObj || objectExpressionAstObj.type !== AST_OBJECT_TYPES.OBJECT_EXPRESSION) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.OBJECT_EXPRESSION} object.`);
        }

        let properties = objectExpressionAstObj.properties.map((prop) => {
            return new ObjectProperty(this.expressionParser(prop.key), this.expressionParser(prop.value));
        });

        return new ObjectExpression(properties);
    }

    static logicalExpressionParser(logicalExpressionAstObj) {
        if (!logicalExpressionAstObj || logicalExpressionAstObj.type !== AST_OBJECT_TYPES.LOGICAL_EXPRESSION) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.LOGICAL_EXPRESSION} object.`);
        }
        let operator = logicalExpressionAstObj.operator;
        let left = this.expressionParser(logicalExpressionAstObj.left);
        let right = this.expressionParser(logicalExpressionAstObj.right);

        return new LogicalExpression(left, right, operator);
    }

    static binaryExpressionParser(binaryExpressionAstObj) {
        if (!binaryExpressionAstObj || binaryExpressionAstObj.type !== AST_OBJECT_TYPES.BINARY_EXPRESSION) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.BINARY_EXPRESSION} object.`);
        }
        let operator = binaryExpressionAstObj.operator;
        let left = this.expressionParser(binaryExpressionAstObj.left);
        let right = this.expressionParser(binaryExpressionAstObj.right);

        return new BinaryExpression(left, right, operator);
    }

    static unaryExpressionParser(unaryExpressionAstObj) {
        if (!unaryExpressionAstObj || unaryExpressionAstObj.type !== AST_OBJECT_TYPES.UNARY_EXPRESSION) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.UNARY_EXPRESSION} object.`);
        }
        let operator = unaryExpressionAstObj.operator;
        let argument = this.expressionParser(unaryExpressionAstObj.argument);

        return new UnaryExpression(argument, operator);
    }

    static assignmentExpressionParser(assignmentExpressionAstObj) {
        if (!assignmentExpressionAstObj || assignmentExpressionAstObj.type !== AST_OBJECT_TYPES.ASSIGNMENT_EXPRESSION) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.ASSIGNMENT_EXPRESSION} object.`);
        }
        let operator = assignmentExpressionAstObj.operator;
        let left = this.expressionParser(assignmentExpressionAstObj.left);
        let right = this.expressionParser(assignmentExpressionAstObj.right);

        return new AssignmentStatement(left, right, operator);
    }

    static updateExpressionParser(updateExpressionAstObj) {
        if (!updateExpressionAstObj || updateExpressionAstObj.type !== AST_OBJECT_TYPES.UPDATE_EXPRESSION) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.UPDATE_EXPRESSION} object.`);
        }
        let operator = updateExpressionAstObj.operator;
        let argument = this.expressionParser(updateExpressionAstObj.argument);
        let prefix = updateExpressionAstObj.prefix;

        return new UpdateExpression(argument, prefix, operator);
    }

    static identifierParser(identifierAstObj) {
        if (!identifierAstObj || identifierAstObj.type !== AST_OBJECT_TYPES.IDENTIFIER) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.IDENTIFIER} object.`);
        }
        return new Identifier(identifierAstObj.name);
    }

    static breakStatementParser(breakStmtAstObj) {
        if (!breakStmtAstObj || breakStmtAstObj.type !== AST_OBJECT_TYPES.BREAK_STATEMENT) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.BREAK_STATEMENT} object.`);
        }
        return new BreakStatement(breakStmtAstObj.label);
    }

    static continueStatementParser(continueStmtAstObj) {
        if (!continueStmtAstObj || continueStmtAstObj.type !== AST_OBJECT_TYPES.CONTINUE_STATEMENT) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.CONTINUE_STATEMENT} object.`);
        }
        return new ContinueStatement(continueStmtAstObj.label);
    }

    static literalParser(literalAstObj) {
        if (!literalAstObj || literalAstObj.type !== AST_OBJECT_TYPES.LITERAL) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.LITERAL} object.`);
        }
        return new Literal(literalAstObj.value);
    }

    static returnStatementParser(returnStatementAstObj) {
        if (!returnStatementAstObj || returnStatementAstObj.type !== AST_OBJECT_TYPES.RETURN_STATEMENT) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.RETURN_STATEMENT} object.`);
        }
        let argument = returnStatementAstObj.argument;
        return new ReturnStatement(argument ? this.expressionParser(argument) : argument);
    }

    static blockStatementParser(blockStatementAstObj) {
        if (!blockStatementAstObj || blockStatementAstObj.type !== AST_OBJECT_TYPES.BLOCK_STATEMENT) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.BLOCK_STATEMENT} object.`);
        }
        let block = blockStatementAstObj.body.flatMap((statement) => {
            return this.expressionParser(statement);
        });
        if (block && block.length > 0) return new BlockStatement(block);
        else return new BlockStatement([]);
    }

    static arrayExpressionParser(arrayExpressionAstObj) {
        if (!arrayExpressionAstObj || arrayExpressionAstObj.type !== AST_OBJECT_TYPES.ARRAY_EXPRESSION) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.ARRAY_EXPRESSION} object.`);
        }
        let elements = arrayExpressionAstObj.elements.flatMap((statement) => {
            return this.expressionParser(statement);
        });
        let arrayExpression = new ArrayExpression(elements);
        return arrayExpression;
    }

    static conditionalStatementParser(conditionalStatementObj) {
        if (!conditionalStatementObj || conditionalStatementObj.type !== AST_OBJECT_TYPES.CONDITIONAL_EXPRESSION) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.CONDITIONAL_EXPRESSION} object.`);
        }
        let condition = this.expressionParser(conditionalStatementObj.test);
        let then = this.expressionParser(conditionalStatementObj.consequent);
        let alternates = this.expressionParser(conditionalStatementObj.alternate);

        return new ConditionalStatement(condition, then, alternates);
    }

    static ifStatementParser(ifStatementObj) {
        if (!ifStatementObj || ifStatementObj.type !== AST_OBJECT_TYPES.IF_STATEMENT) {
            throw new Error(`Not a ${AST_OBJECT_TYPES.IF_STATEMENT} object.`);
        }
        let condition = this.expressionParser(ifStatementObj.test);
        let then = this.expressionParser(ifStatementObj.consequent);
        let alternates = ifStatementObj.alternate ? this.expressionParser(ifStatementObj.alternate) : null;

        return new ConditionalStatement(condition, then, alternates);
    }

    static loopStatementParser(loopStatementAstObj) {
        let condition;
        if (loopStatementAstObj.type === AST_OBJECT_TYPES.FOR_OF_STATEMENT || loopStatementAstObj.type === AST_OBJECT_TYPES.FOR_IN_STATEMENT) {
            condition = this.expressionParser(loopStatementAstObj.left);
        } else {
            condition = this.expressionParser(loopStatementAstObj.test);
        }

        let body = this.expressionParser(loopStatementAstObj.body);

        if (loopStatementAstObj.type === AST_OBJECT_TYPES.FOR_STATEMENT) {
            let init = this.variableDeclarationsParser(loopStatementAstObj.init);
            let update = this.expressionParser(loopStatementAstObj.update);
            return new ForStatement(loopStatementAstObj.type, condition, body, init, update);
        } else if (loopStatementAstObj.type === AST_OBJECT_TYPES.WHILE_STATEMENT) {
            return new WhileStatement(loopStatementAstObj.type, condition, body);
        } else if (loopStatementAstObj.type === AST_OBJECT_TYPES.DO_WHILE_STATEMENT) {
            return new DoWhileStatement(loopStatementAstObj.type, condition, body);
        } else if (
            loopStatementAstObj.type === AST_OBJECT_TYPES.FOR_OF_STATEMENT ||
            loopStatementAstObj.type === AST_OBJECT_TYPES.FOR_IN_STATEMENT
        ) {
            let rightSide = this.expressionParser(loopStatementAstObj.right);
            condition.uniqueText = `${condition.asText()} ${
                loopStatementAstObj.type === AST_OBJECT_TYPES.FOR_IN_STATEMENT ? "in" : "of"
            } ${rightSide.asText()}`;
            return new ForEachStatement(loopStatementAstObj.type, condition, body);
        }
    }

    static functionDeclarationParser(functionDeclarationObj) {
        let id = this.expressionParser(functionDeclarationObj.id);
        let params = functionDeclarationObj.params.flatMap((param) => {
            return this.expressionParser(param);
        });
        let body = this.expressionParser(functionDeclarationObj.body);
        let isAsync = functionDeclarationObj.async;
        let isGenerator = functionDeclarationObj.generator;

        return new FunctionDeclaration(id, params, body, isAsync, isGenerator);
    }

    static functionExpressionParser(functionExpressionObj) {
        let params = functionExpressionObj.params.flatMap((param) => {
            return this.expressionParser(param);
        });
        let body = this.expressionParser(functionExpressionObj.body);
        let isAsync = functionExpressionObj.async;
        let isGenerator = functionExpressionObj.generator;

        return new FunctionExpression(params, body, isAsync, isGenerator);
    }

    static arrowFunctionExpressionParser(arrowFunctionExpressionObj) {
        let params = arrowFunctionExpressionObj.params.flatMap((param) => {
            return this.expressionParser(param);
        });
        let body = this.expressionParser(arrowFunctionExpressionObj.body);
        let isAsync = arrowFunctionExpressionObj.async;

        return new ArrowFunctionExpression(params, body, isAsync);
    }

    static assignmentPatternParser(assignmentPatternObj) {
        let left = this.expressionParser(assignmentPatternObj.left);
        let right = this.expressionParser(assignmentPatternObj.right);

        return new AssignmentPattern(left, right);
    }

    static templateLiteralParser(templateLiteralObj) {
        let quasis = templateLiteralObj.quasis;
        let expressions = templateLiteralObj.expressions.flatMap((expr) => {
            return { expression: this.expressionParser(expr), loc: expr.loc };
        });

        return new TemplateLiteral(quasis, expressions);
    }
}

module.exports = AstObjectTypesParser;
