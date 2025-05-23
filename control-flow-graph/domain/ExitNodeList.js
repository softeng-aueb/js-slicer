class ExitNodeList {
    // FIXME: This should be renamed to JoinNode
    // The JoinNode abstraction represents a set of CFG nodes 
    // whose outgoing edges will meet to a single node
    // actually the join point of a set of alternative flows
    
    // We don't need an id
    static idCount = 1;

    constructor(list) {
        this.list = [...list];
        this._id = "NL" + ExitNodeList.idCount++;
    }

    getItemIds() {
        let printStr = "";
        this.list.forEach((it) => {
            printStr = printStr.concat(`${it.id} `);
        });

        return printStr;
    }

    // FIXME: we don't need this
    get id() {
        return this._id;
    }

    // FIXME: we don't need this
    // The details would be encapsulated
    getList() {
        return this.list;
    }

    hasDanglingEdges() {
        return false;
    }

    getRoot() {
        return this;
    }

    // FIXME: the method merges to the current JoinNode another JoinNode or plain CFGNode
    // The join node's list is expanded with the contents of the JoinNode or the plain node
    merge(node){
        // if node is plain node push
        // else push node.getList()
        this.list.push(node)
    }

    addNextNode(node) {
        for (let n of this.list) {
            n.addOutgoingEdge(node.getRoot());
            node.getRoot().addParent(n);
        }
    }
}

module.exports = ExitNodeList;
