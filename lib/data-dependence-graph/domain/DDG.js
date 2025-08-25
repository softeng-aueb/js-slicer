class DDG {

    constructor(nodes) {
        this._nodes = nodes;
    }

    get nodes() {
        return this._nodes;
    }

    set nodes(value) {
        this._nodes = value;
    }

    getNodeById (nodeId){
        return this._nodes.find(node => node._id === nodeId);
    }

}
module.exports = DDG;