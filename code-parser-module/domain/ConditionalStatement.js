class ConditionalStatement {
    constructor(condition,then,alternates) {
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

    get body() {
        return this._then;
    }

    set body(value) {
        this._then = value;
    }



}
module.exports = ConditionalStatement;