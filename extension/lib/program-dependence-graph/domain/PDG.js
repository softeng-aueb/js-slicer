class PDG {

    constructor(nodes) {
        this._nodes = nodes;
    }

    get nodes() {
        return this._nodes;
    }

    set nodes(value) {
        this._nodes = value;
    }

}
module.exports = PDG;