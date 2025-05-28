const LoopStatement = require("./LoopStatement");

class DoWhileStatement extends LoopStatement {
    constructor(type, condition, body) {
        super(type, condition, body);
    }

    accept(visitor) {
        visitor.visitDoWhileStatement(this);
    }
}
module.exports = DoWhileStatement;
