const FDTNode = require("../../forward-dominance-tree/domain/FDTNode");
const FDTEdge = require("../../forward-dominance-tree/domain/FDTEdge");
const FDT = require("../../forward-dominance-tree/domain/FDT");

class CFG {

    constructor(nodes) {
        this._nodes = nodes;
    }

    get nodes() {
        return this._nodes;
    }

    set nodes(value) {
        this._nodes = value;
    }

    getForwardDominanceTree (){
        let reversedNodes = this._nodes.slice().reverse();
        let fdtNodes = reversedNodes.map(node =>{
            return new FDTNode(node.id,null,node._statement,this.getFDTNodeEdges(node));
        });
        return new FDT(fdtNodes);
    }

    getFDTNodeEdges(cfgNode){
        let cfgNodes = this._nodes.filter(node => {
            if(Array.isArray(node._edges)){
                return node._edges.find(edge =>  edge._target === cfgNode.id);
            }
            return node._edges._target === cfgNode.id;
        });

        return cfgNodes.map(node =>   new FDTEdge(cfgNode.id,node.id));
    }

    getAllEdges(){
        return this._nodes.flatMap(node => {
            return node._edges;
        })
    }
}
module.exports = CFG;