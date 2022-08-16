const FDT = require("../forward-dominance-tree/domain/FDT");
const CFG = require("../control-flow-graph/domain/CFG");
const CDGNode = require("./domain/CDGNode");
const Graph = require("../utils/graphUtils");
const CDGNodeNames = require("./constants/CDGNodeNames");
const CDGEdge = require("./domain/CDGEdge");
const CDG = require("./domain/CDG");
const _ = require("lodash")

class CDGGenerator {

    static generateCDG(cfg,fdt) {
        if(!cfg || !fdt || !cfg instanceof CFG || !fdt instanceof FDT){
            throw new Error(`Missing required param.`)
        }
        let pathsArray = new Graph(cfg._nodes.length).getCFGPaths(cfg)
        let cdg = [new CDGNode(CDGNodeNames.ENTRY,null,[])];

        cfg._nodes.forEach(node => {
            let dominantNodeId = fdt.getImmediateDominantId(node._id);
            if(!dominantNodeId) {
                cdg.push(new CDGNode(node._id,node._statement,[]))
                let newEdge = new CDGEdge(CDGNodeNames.ENTRY, node._id)
                if(!cdg[0]._edges.some(edge => _.isEqual(edge,newEdge))){
                    cdg[0]._edges.push(newEdge);
                }
            }else{
                let nodeTopology = pathsArray.filter(topology => topology._source === node._id);

                let cdgNodeEdges = []
                nodeTopology.forEach(topology => {
                    if(!topology._paths.find(path => path.includes(dominantNodeId))){
                        let newEdge = new CDGEdge(topology._source, topology._target);
                        if(!cdgNodeEdges.some(edge => _.isEqual(edge,newEdge))){
                            cdgNodeEdges.push(newEdge);
                        }
                    }else{
                        let newEdge = new CDGEdge(CDGNodeNames.ENTRY, topology._target)
                        if(!cdg[0]._edges.some(edge => _.isEqual(edge,newEdge))){
                            cdg[0]._edges.push(newEdge);
                        }
                    }
                });
                cdg.push(new CDGNode(node._id,node._statement,cdgNodeEdges))
            }
        });

        return new CDG(cdg);
    }
}

module.exports = CDGGenerator;