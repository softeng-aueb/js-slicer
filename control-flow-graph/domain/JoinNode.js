class JoinNode {
    static idCount = 1;

    constructor() {
        this.list = [];
        this._id = "JN" + JoinNode.idCount++;
    }

    get id() {
        return this._id;
    }

    getRoot() {
        return this;
    }

    hasDanglingEdges() {
        return false;
    }

    merge(node) {
        if (!node) return;
        if (node.list) {
            this.list.push(...node.list);
        } else {
            this.list.push(node);
        }
    }

    addNextNode(node) {
        for (let n of this.list) {
            n.addOutgoingEdge(node.getRoot());
            node.getRoot().addParent(n);
        }
    }
}

module.exports = JoinNode;
