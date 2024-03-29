const CDGNode = require("../domain/CDGNode");
const CDGEdge = require("../domain/CDGEdge");
const CDGNodeName = require("../constants/CDGNodeNames");
const CFGEdge = require("../../control-flow-graph/domain/CFGEdge");
const getCDGNodeEdges = (cfg, cfgNodeId) => {
    let cfgNode = cfg.find(node => node._id === cfgNodeId);
    if(!cfgNode) return;

    let edges = [];
    cfgNode._edges.forEach(edge =>{
        if(edge._condition === true){
            edges.push(new CDGEdge(edge._source,edge._target))
        }

        if(cfg.find(node => node._id === edge._target && node._executionCondition === "else")){
            edges.push(new CDGEdge(edge._source,edge._target))
        }
    })
    return edges;
};

const getCDGEntryNodeEdges = (cfg) => {
    let entryNodeEdges = [];
    cfg.forEach(cfgNode => {
        if(!cfgNode.isDependantNode(cfg)){
            entryNodeEdges.push(new CDGEdge(CDGNodeName.ENTRY, cfgNode._id))
        }
    });
    return entryNodeEdges;
};

module.exports = {
    getCDGNodeEdges,
    getCDGEntryNodeEdges
}