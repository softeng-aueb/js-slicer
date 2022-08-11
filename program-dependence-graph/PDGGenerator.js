const DDG = require("../data-dependence-graph/domain/DDG");
const CFG = require("../control-flow-graph/domain/CFG");
const PDGNode = require("./domain/PDGNode");

class PDGGenerator{

    static generatePDG(cfg,ddg){
        if(!cfg || !cfg instanceof CFG || !ddg || !ddg instanceof DDG){
            throw new Error(`Missing required param.`)
        }

        return cfg._nodes.map(node =>{
            let ddgNode = ddg.getNodeById(node._id);
            let pdgNodeEdges = (Array.isArray(node._edges)) ? node._edges.concat(ddgNode._edges) :  [node._edges].concat(ddgNode._edges)
            return new PDGNode (node._id,null,node._statement,pdgNodeEdges);
        })
    }

}

module.exports = PDGGenerator;