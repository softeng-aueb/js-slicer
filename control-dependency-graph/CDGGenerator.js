const FDT = require("../forward-dominance-tree/domain/FDT");
const CFG = require("../control-flow-graph/domain/CFG");
const CDGNode = require("./domain/CDGNode");
const Graph = require("../utils/graphUtils");
const CDGNodeNames = require("./constants/CDGNodeNames");
const CDGEdge = require("./domain/CDGEdge");
const CDG = require("./domain/CDG");

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
                cdg.push(new CDGNode(node._id,null,[]))
                cdg[0]._edges.push(new CDGEdge(CDGNodeNames.ENTRY, node._id));
            }else{
                let nodeTopology = pathsArray.filter(topology => topology._source === node._id);

                let cdgNodeEdges = []
                nodeTopology.forEach(topology => {
                    if(!topology._paths.find(path => path.includes(dominantNodeId))){
                        cdgNodeEdges.push(new CDGEdge(topology._source, topology._target))
                    }else{
                        cdg[0]._edges.push(new CDGEdge(CDGNodeNames.ENTRY, topology._target));
                    }
                });
                cdg.push(new CDGNode(node._id,null,cdgNodeEdges))
            }
        });

        return new CDG(cdg);
    }
}

module.exports = CDGGenerator;