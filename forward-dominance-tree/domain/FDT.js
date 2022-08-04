class FDT {

    constructor(nodes) {
        this._nodes = nodes;
    }

    get nodes() {
        return this._nodes;
    }

    set nodes(value) {
        this._nodes = value;
    }

    getImmediateDominantId(nodeId){
        let fdtEdges = this.getAllEdges();
        let foundEdge = fdtEdges.find(edge => edge._target === nodeId)
        if(!foundEdge) return ;
        return foundEdge._source;
    }
    getAllEdges(){
        return this._nodes.flatMap(node => {
            return node._edges;
        })
    }

}
module.exports = FDT;