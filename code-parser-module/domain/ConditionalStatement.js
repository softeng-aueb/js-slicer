class ConditionalStatement {
    constructor(condition,body) {
        this._condition = condition;
        this._body = body;
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



}
module.exports = ConditionalStatement;