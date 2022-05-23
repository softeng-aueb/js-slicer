class ConditionalStatement {
    constructor(condition,body,alternates) {
        this._condition = condition;
        this._body = body;
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

    get body() {
        return this._body;
    }

    set body(value) {
        this._body = value;
    }



}
module.exports = ConditionalStatement;