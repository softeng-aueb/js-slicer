const LoopStatement = require("./LoopStatement");

class ForEachStatement extends LoopStatement {
    constructor(type, condition, body) {
        super(type, condition, body);
    }

    accept(visitor, isCalledAsFirstOnDoWhile = false) {
        return visitor.visitForEachStatement(this, isCalledAsFirstOnDoWhile);
    }
}
module.exports = ForEachStatement;
