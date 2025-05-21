class ExitNodeList {
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

    get id() {
        return this._id;
    }

    getList() {
        return this.list;
    }

    hasDanglingEdges() {
        return false;
    }

    getRoot() {
        return this;
    }

    addNextNode(node) {
        for (let n of this.list) {
            n.addOutgoingEdge(node.getRoot());
            node.getRoot().addParent(n);
        }
    }
}

module.exports = ExitNodeList;
