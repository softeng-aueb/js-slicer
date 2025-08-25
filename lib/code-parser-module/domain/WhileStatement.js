const LoopStatement = require("./LoopStatement");

class WhileStatement extends LoopStatement {
    constructor(type, condition, body) {
        super(type, condition, body);
    }

    accept(visitor, isCalledAsFirstOnDoWhile = false) {
        return visitor.visitWhileStatement(this, isCalledAsFirstOnDoWhile);
    }
}
module.exports = WhileStatement;
