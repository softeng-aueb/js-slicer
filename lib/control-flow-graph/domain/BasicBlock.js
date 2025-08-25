const CFGEdge = require("./CFGEdge");
class BasicBlock {
    constructor(id) {
        this._id = id;
        this._nodes = [];
        this._edges = [];
        this._label = id;
    }

    get id() {
        return this._id;
    }

    set id(num) {
        this._id = num;
    }

    get nodes() {
        return this._nodes;
    }

    get edges() {
        return this._edges;
    }

    get label() {
        return this._label;
    }

    set label(name) {
        this._label = name;
    }

    nextNodes(visited) {
        let result = [];
        for (let e of this._edges) {
            if (!visited.includes(e.targetNode)) result.push(e.targetNode);
        }
        return result;
    }

    hasEdgeToBlock(block) {
        let outNodeIds = block.nodes.map((node) => node.id);
        for (let node of this._nodes) {
            for (let edge of node.edges) {
                for (let outNode of outNodeIds) {
                    if (edge.target == outNode) return edge.condition;
                }
            }
        }
        return null;
    }

    hasEdgeTo(blockId) {
        let result = this.edges.filter((e) => e.target === blockId);
        if (result && result.length > 0) {
            return true;
        }
        return false;
    }

    addNode(node) {
        // Do not add the same node twice
        if (this._nodes.includes(node)) {
            return;
        }
        this._nodes.push(node);
    }

    addOutgoingEdge(targetNode, condition) {
        //console.log(`Adding edge from ${this._id} to ${targetNode.id} with condition: ${condition}`);
        let edge = new CFGEdge(this.id, targetNode.id, condition, this, targetNode);
        this._edges.push(edge);
    }
}

module.exports = BasicBlock;
