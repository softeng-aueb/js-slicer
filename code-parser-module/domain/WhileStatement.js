const LoopStatement = require("./LoopStatement");

class WhileStatement extends LoopStatement {
    constructor(type, condition, body) {
        super(type, condition, body);
    }

    accept(visitor) {
        return visitor.visitWhileStatement(this);
    }
}
module.exports = WhileStatement;
