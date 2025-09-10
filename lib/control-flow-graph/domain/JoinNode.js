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

    merge(item) {
        if (!item) return;
        if (item.length != undefined && item.length == 0) return;
        if (item.list) {
            // JoinNode
            this.list.push(...item.list);
        } else if (item.length) {
            // List
            this.list.push(...item);
        } else {
            //CFGNode
            this.list.push(item);
        }
    }

    addNextNode(node) {
        for (let n of this.list) {
            n.addNextNode(node);
        }
    }
}

module.exports = JoinNode;
