const ConditionalStatement = require("./ConditionalStatement");
const LoopStatement = require("./LoopStatement");

class ForStatement extends LoopStatement {
    constructor(type, condition, body, init, update) {
        super(type, condition, body);
        this._init = init;
        this._update = update;
    }

    get init() {
        return this._init;
    }

    set init(value) {
        this._init = value;
    }

    get update() {
        return this._update;
    }

    set update(value) {
        this._update = value;
    }

    get updateVar() {
        return this._update.argument.name;
    }

    accept(visitor, isCalledAsFirstOnDoWhile = false) {
        return visitor.visitForStatement(this, isCalledAsFirstOnDoWhile);
    }
}
module.exports = ForStatement;
