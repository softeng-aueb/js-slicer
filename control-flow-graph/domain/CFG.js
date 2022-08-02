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
        let fdtNodes = this._nodes.reverse().map(node =>{
            return new FDTNode(node.id,null,node._statement,this.getFDTNodeEdges(node));
        });
        return new FDT(fdtNodes);
    }

    getFDTNodeEdges(cfgNode){
        return this._nodes.filter(node => {
            if(Array.isArray(node._edges)){
                if(node._edges.find(edge =>  edge._target === cfgNode.id)){
                    return new FDTEdge(cfgNode.id,node.id);
                }
            }
            if(node._edges._target === cfgNode.id){
                return new FDTEdge(cfgNode.id,node.id);
            }
        });
    }
}
module.exports = CFG;