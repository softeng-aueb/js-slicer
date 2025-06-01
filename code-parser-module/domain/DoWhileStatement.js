const LoopStatement = require("./LoopStatement");

class DoWhileStatement extends LoopStatement {
    constructor(type, condition, body) {
        super(type, condition, body);
    }

    accept(visitor) {
        return visitor.visitDoWhileStatement(this);
    }
}
module.exports = DoWhileStatement;
