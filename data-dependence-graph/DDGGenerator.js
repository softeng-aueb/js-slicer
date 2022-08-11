const CFG = require("../control-flow-graph/domain/CFG");
const DDGNode = require("./domain/DDGNode");
const DDG = require("./domain/DDG");

class DDGGenerator {

    static generateDDG(cfg) {
        if(!cfg || !cfg instanceof CFG){
            throw new Error(`Missing required param.`)
        }
        let ddgNodes = [];
        cfg._nodes.forEach(node => {
            ddgNodes.push(new DDGNode(node._id, node._statement, cfg.getDataDependencyEdgesForNode(node._id)));
        })

        return new DDG(ddgNodes);
    }
}

module.exports = DDGGenerator;