const LoopStatement = require("./LoopStatement");

class DoWhileStatement extends LoopStatement {
    constructor(type, condition, body) {
        super(type, condition, body);
    }

    accept(visitor, isCalledAsFirstOnDoWhile = false) {
        return visitor.visitDoWhileStatement(this, isCalledAsFirstOnDoWhile);
    }
}
module.exports = DoWhileStatement;
