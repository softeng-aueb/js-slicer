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



}
module.exports = LoopStatement;