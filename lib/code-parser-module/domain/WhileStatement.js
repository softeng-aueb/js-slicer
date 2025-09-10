const LoopStatement = require("./LoopStatement");

class WhileStatement extends LoopStatement {
    constructor(type, condition, body) {
        super(type, condition, body);
    }

    accept(visitor, returnFirstStatement = false) {
        return visitor.visitWhileStatement(this, returnFirstStatement);
    }
}
module.exports = WhileStatement;
