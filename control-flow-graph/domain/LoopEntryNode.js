const astObjectTypes = require("../../code-parser-module/constants/astObjectTypes");
const CFGEdge = require("./CFGEdge");
const CFGNode = require("./CFGNode");

class LoopEntryNode extends CFGNode {
    constructor(id, executionCondition, statement, edges, parent) {
        super(id, executionCondition, statement, edges, parent);
        this._breakNodes = [];
    }

    addBreakNode(node) {
        this._breakNodes.push(node);
    }

    get breakNodes() {
        return this._breakNodes;
    }
}
module.exports = LoopEntryNode;
