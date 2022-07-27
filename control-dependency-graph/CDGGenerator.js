const CDGNode = require("./domain/CDGNode");
const CDGEdge = require("./domain/CDGEdge");
const CDGNodeName = require("./constants/CDGNodeNames");
const Parser = require("../code-parser-module/Parser");
const CFGGenerator = require("../control-flow-graph/CFGGenerator");
const {getCDGNodeEdges,getCDGEntryNodeEdges} = require("./helpers/cdgNodesHelper");

class CDGGenerator {

    static generateCDG(cfg) {
        if(!cfg ||  !Array.isArray(cfg)){
            throw new Error(`Missing required param.`)
        }

        let cdg = [new CDGNode(CDGNodeName.ENTRY,null,getCDGEntryNodeEdges(cfg))];

        //Create and push initial node
       return cdg.concat(cfg.map(cfgNode => {
            return new CDGNode(cfgNode._id,cfgNode._statement,getCDGNodeEdges(cfg, cfgNode._id));
        }));
    }
}

module.exports = CDGGenerator;

let func = Parser.parse([
    "(a, b) => {",
    "while (y>0 && y>1){ ",
    " y=y+1",
    "}" ,
    " return x",
    "}"
]);


let y = CDGGenerator.generateCDG(CFGGenerator.generateCfg(func));
console.log(y);