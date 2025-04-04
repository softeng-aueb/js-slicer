const CFGNode = require("./CFGNode");

class DecisionNode {
    constructor(conditionRoot, trueEdges, falseEdges, nesting) {
        this.conditionRoot = conditionRoot;
        this.trueEdges = trueEdges;
        this.falseEdges = falseEdges;
        this.nesting = nesting;
        this.allTrueEdgesConnected = this.trueEdges.length === 0 ? true : false;
        this.allFalseEdgesConnected = this.falseEdges.length === 0 ? true : false;
    }

    hasDanglingEdges() {
        return this.allTrueEdgesConnected && this.allFalseEdgesConnected;
    }

    getRoot() {
        return this.conditionRoot;
    }

    addNextNode(node) {
        if (!this.allTrueEdgesConnected) {
            for (const n of this.trueEdges) {
                n.addOutgoingEdge(node, n.isNegated ? false : true);
                node.addParent(n);
            }
            this.allTrueEdgesConnected = true;
        }
        if (!this.allFalseEdgesConnected) {
            for (const n of this.falseEdges) {
                n.addOutgoingEdge(node, n.isNegated ? true : false);
                node.addParent(n);
            }
            this.allFalseEdgesConnected = true;
        }
    }
}
module.exports = DecisionNode;
