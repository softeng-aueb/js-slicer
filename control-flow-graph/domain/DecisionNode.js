const CFGNode = require("./CFGNode");

class DecisionNode {
    static idCount = 1;

    constructor(conditionRoot, trueEdges, falseEdges, nesting) {
        this.conditionRoot = conditionRoot;
        this.trueEdges = trueEdges;
        this.falseEdges = falseEdges;
        this._nesting = nesting;
        this.allTrueEdgesConnected = false;
        this.allFalseEdgesConnected = false;
        this.id = "DN" + DecisionNode.idCount++;
    }

    static get nesting() {
        return this._nesting;
    }

    set nesting(value) {
        this._nesting = value;
    }

    hasDanglingEdges() {
        return !(this.allTrueEdgesConnected && this.allFalseEdgesConnected);
    }

    getRoot() {
        return this.conditionRoot;
    }

    addNextNode(node) {
        if (!this.allTrueEdgesConnected) {
            for (const n of this.trueEdges) {
                n.addOutgoingEdge(node.getRoot(), n.isNegated ? false : true);
                node.getRoot().addParent(n);
            }
            this.allTrueEdgesConnected = true;
        } else if (!this.allFalseEdgesConnected) {
            for (const n of this.falseEdges) {
                n.addOutgoingEdge(node.getRoot(), n.isNegated ? true : false);
                node.getRoot().addParent(n);
            }
            this.allFalseEdgesConnected = true;
        }
    }
}
module.exports = DecisionNode;
