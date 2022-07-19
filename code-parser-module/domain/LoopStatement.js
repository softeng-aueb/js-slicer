
class LoopStatement {
    constructor(type,condition,body) {
        this._type = type;
        this._condition = condition;
        this._body = body;

    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }

    get condition() {
        return this._condition;
    }

    set condition(value) {
        this._condition = value;
    }

    get body() {
        return this._body;
    }

    set body(value) {
        this._body = value;
    }

    getListOfInnerStatements(statements){
        statements.push(this._condition)
        if (!Array.isArray(this._body) && (this._body instanceof ConditionalStatement || this._body instanceof LoopStatement)) {
            this._body.getListOfInnerStatements(statements)
        }else{
            for (let i in this._body){
                let statement = this._body[i];
                if (statement instanceof ConditionalStatement || statement instanceof LoopStatement) {
                    statement.getListOfInnerStatements(statements)
                } else {
                    statements = statements.concat(statement);
                }
            }
        }
        return statements;
    }

}
module.exports = LoopStatement;