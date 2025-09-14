const LoopStatement = require("./LoopStatement");

class ForEachStatement extends LoopStatement {
    constructor(type, condition, body) {
        super(type, condition, body);
    }

    accept(visitor, returnFirstStatement = false) {
        return visitor.visitForEachStatement(this, returnFirstStatement);
    }
}
module.exports = ForEachStatement;
