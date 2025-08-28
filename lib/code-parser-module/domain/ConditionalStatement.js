const CFGNode = require("../../control-flow-graph/domain/CFGNode");
const CFGEdge = require("../../control-flow-graph/domain/CFGEdge");
const LoopStatement = require("./LoopStatement");
const _ = require("lodash");

class ConditionalStatement {
    constructor(condition, then, alternates) {
        this._condition = condition;
        this._then = then;
        this._alternates = alternates;
    }

    get alternates() {
        return this._alternates;
    }

    set alternates(value) {
        this._alternates = value;
    }

    get condition() {
        return this._condition;
    }

    set condition(value) {
        this._condition = value;
    }

    get then() {
        return this._then;
    }

    set then(value) {
        this._then = value;
    }

    getListOfStatementsPerCondition(statements, condition) {
        if (_.isEqual(condition, this._condition)) {
            statements = statements.concat(this._then);
        } else {
            if (this._alternates instanceof ConditionalStatement) {
                this._alternates.getListOfStatementsPerCondition(statements, condition);
            }
        }
        return statements;
    }

    getListOfInnerStatements(statements) {
        statements.push(this._condition);
        if (!Array.isArray(this._then) && (this._then instanceof ConditionalStatement || this._then instanceof LoopStatement)) {
            this._then.getListOfInnerStatements(statements);
        } else {
            for (let i in this._then) {
                let statement = this._then[i];
                if (!Array.isArray(statement) && (statement instanceof ConditionalStatement || statement instanceof LoopStatement)) {
                    return statement.getListOfInnerStatements(statements);
                } else {
                    statements = statements.concat(statement);
                }
            }
        }
        if (this._alternates instanceof ConditionalStatement || this._alternates instanceof LoopStatement) {
            this._alternates.getListOfInnerStatements(statements);
        } else {
            for (let i in this._alternates) {
                let statement = this._alternates[i];
                if (statement instanceof ConditionalStatement || statement instanceof ConditionalStatement) {
                    return statement.getListOfInnerStatements(statements);
                } else {
                    statements = statements.concat(statement);
                }
            }
        }
        return statements;
    }

    asText() {
        return `${this._condition.asText()} ? ${this._then.asText()} : ${this._alternates.asText()}`;
    }

    accept(visitor, isCalledAsFirstOnDoWhile = false) {
        return visitor.visitConditionalStatement(this, isCalledAsFirstOnDoWhile);
    }
}
module.exports = ConditionalStatement;
