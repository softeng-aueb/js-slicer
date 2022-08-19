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
            let cdgNodeEdges = [];
            let dominantNodeId = fdt.getImmediateDominantId(node._id);
            if (_.isUndefined(dominantNodeId)) dominantNodeId = CDGNodeNames.ENTRY
            let remainingNodes = cfg._nodes.filter(rNode => rNode._id !== node._id);
            remainingNodes.forEach(rNode => {
                let nodeTopology = pathsArray.filter(topology => topology._source === node._id && topology._target === rNode._id);
                nodeTopology.forEach(topology => {
                    if (!topology._paths.find(path => path.includes(dominantNodeId))) {
                        let newEdge = new CDGEdge(topology._source, topology._target);
                        if (!cdgNodeEdges.some(edge => _.isEqual(edge, newEdge))) {
                            cdgNodeEdges.push(newEdge);
                        }
                    }
                });
            })
            cdg.push(new CDGNode(node._id, node._statement, cdgNodeEdges))
        });

       let cdgEdges = cdg.flatMap(cdgNode =>  cdgNode._edges);
       cfg._nodes.forEach(cfgNode => {
           if(!cdgEdges.some(edge => edge._target === cfgNode._id)){
               cdg[0]._edges.push( new CDGEdge(CDGNodeNames.ENTRY, cfgNode._id))
           }
       })

        return new CDG(cdg);
    }
}

module.exports = CDGGenerator;