const DDG = require("../data-dependence-graph/domain/DDG");
const CDG = require("../control-dependency-graph/domain/CDG");
const PDGNode = require("./domain/PDGNode");
const CDGNodeNames = require("../control-dependency-graph/constants/CDGNodeNames");
class PDGGenerator{

    static generatePDG(cdg,ddg){
        if(!cdg || !cdg instanceof CDG || !ddg || !ddg instanceof DDG){
            throw new Error(`Missing required param.`)
        }

        return cdg._nodes.map(node =>{
            if(node._id === CDGNodeNames.ENTRY){
                return new PDGNode (node._id,null,node._statement,node._edges);
            }
            let ddgNode = ddg.getNodeById(node._id);
            let pdgNodeEdges =  node._edges.concat(ddgNode._edges);
            return new PDGNode (node._id,null,node._statement,pdgNodeEdges);
        })
    }

}

module.exports = PDGGenerator;