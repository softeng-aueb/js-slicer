class Stack {
    constructor() {
        this._elements = [];
    }

    pop() {
        return this._elements.pop();
    }

    push(node) {
        // Implement connection algorithm logic
        if (this._elements.length === 0) {
            this._elements.push(node);
        } else {
            let previousNode = this._elements.pop();
            previousNode.addNextNode(node);

            // Do not remove nodes with dangling edges
            if (previousNode.hasDanglingEdges()) {
                this._elements.push(previousNode);
            }

            this._elements.push(node);

            //TODO: Implement block statement completion logic / same level nesting removal from stack
        }
    }

    pushList(values) {
        for (const v of values) {
            this.push(v);
        }
    }

    peek() {
        if (this._elements.length == 0) {
            return null;
        }
        return this._elements.slice(-1)[0];
    }

    get length() {
        return this._elements.length;
    }

    clear() {
        this._elements = [];
    }

    get elements() {
        return this._elements;
    }

    print() {
        console.log(`[${this._elements.map((n) => n.id).join(", ")}]`);
    }
}

module.exports = Stack;
