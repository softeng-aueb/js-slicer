const LoopStatement = require("./LoopStatement");

class DoWhileStatement extends LoopStatement {
    constructor(type, condition, body) {
        super(type, condition, body);
    }

    accept(visitor, returnFirstStatement = false) {
        return visitor.visitDoWhileStatement(this, returnFirstStatement);
    }
}
module.exports = DoWhileStatement;
