const AST_OBJECT_TYPES = require("../constants/astObjectTypes");
const FUNCTION_TYPES = require("../constants/functionTypes");
const VAR_TYPES = require("../constants/varTypes");
const FunctionParam = require("./FunctionParam");
const AstObjectTypesParser = require("../helpers/AstObjectTypesParser");

class FunctionAst {
    constructor(ast) {
        this.ast = ast;
        this.codeParsedObj = (this.isRegularFunction())
            ? this.ast && this.ast.program && this.ast.program.body && this.ast.program.body[0]
            : this.ast && this.ast.program && this.ast.program.body && this.ast.program.body[0] && this.ast.program.body[0].expression
    }

    isFunction() {
        return this.isRegularFunction() || this.isArrowFunction();
    }

    isRegularFunction() {
        return (this.ast
            && this.ast.program
            && this.ast.program.body
            && this.ast.program.body[0]
            && this.ast.program.body[0].type === AST_OBJECT_TYPES.FUNCTION_DECLARATION)
            ? true : false;
    }

    isArrowFunction() {
        return (this.ast
            && this.ast.program
            && this.ast.program.body
            && this.ast.program.body[0]
            && this.ast.program.body[0].expression
            &&  this.ast.program.body[0].expression.type === AST_OBJECT_TYPES.ARROW_FUNCTION_EXPRESSION)
            ? true : false;
    }

    getFunctionName() {
        return (this.isRegularFunction()) ? this.codeParsedObj.id && this.codeParsedObj.id.name : "";
    }

    getFunctionArgs() {
        let args = this.codeParsedObj && this.codeParsedObj.params || [];
        ;
        return args.map(p => new FunctionParam(p.type, p.name));
    }

    getFunctionType() {
        if (this.codeParsedObj && this.codeParsedObj.async === true) return FUNCTION_TYPES.ASYNC;
        return FUNCTION_TYPES.SYNC;
    }

    getFunctionBody() {
        const bodyStatements = this.codeParsedObj && this.codeParsedObj.body && this.codeParsedObj.body.body || [];
        return bodyStatements.flatMap(statement => {
            if (statement.type === AST_OBJECT_TYPES.VARIABLE_DECLARATION) {
                return AstObjectTypesParser.variableDeclarationsParser(statement);
            } else if (statement.type === AST_OBJECT_TYPES.EXPRESSION_STATEMENT) {
                return AstObjectTypesParser.expressionStatementParser(statement);
            }else if (statement.type === AST_OBJECT_TYPES.RETURN_STATEMENT) {
                return AstObjectTypesParser.returnStatementParser(statement);
            } else if (statement.type === AST_OBJECT_TYPES.IF_STATEMENT) {
                return AstObjectTypesParser.conditionalStatementParser(statement);
            } else if (statement.type === AST_OBJECT_TYPES.FOR_STATEMENT || statement.type === AST_OBJECT_TYPES.WHILE_STATEMENT) {
                return AstObjectTypesParser.loopStatementParser(statement);
            }else if (statement.type === AST_OBJECT_TYPES.EXPRESSION_STATEMENT
                && statement.expression
                && statement.expression.type
                && statement.expression.type === AST_OBJECT_TYPES.ASSIGNMENT_EXPRESSION) {

                return AstObjectTypesParser.assignmentExpression(statement.expression);
            }
        });
    }
}

module.exports = FunctionAst;