const CDGNode = require("./domain/CDGNode");
const CDGEdge = require("./domain/CDGEdge");
const CDGNodeName = require("./constants/CDGNodeNames");

class CDGGenerator {

    static generateCDG(cfg) {
        if(!cfg ||  !Array.isArray(cfg)){
            throw new Error(`Missing required param.`)
        }

        let cdg = [];

        //Create and push initial node
        let entryNode = new CDGNode(CDGNodeName.ENTRY);
        cdg.push();

        cfg.forEach(cfgNode => {
            let entryNodeEdges = [];
            if(!cfgNode.isDependantNode(cfg)){
                entryNodeEdges.push(new CDGEdge(CDGNodeName.ENTRY, cfgNode._id))
            }
        })


    }
}