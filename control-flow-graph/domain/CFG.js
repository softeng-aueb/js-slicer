const CDGNodeNames = require("../../control-dependency-graph/constants/CDGNodeNames");
const FDTNode = require("../../forward-dominance-tree/domain/FDTNode");
const FDTEdge = require("../../forward-dominance-tree/domain/FDTEdge");
const FDT = require("../../forward-dominance-tree/domain/FDT");
const Graph = require("../../utils/graphUtils");
const AssignmentStatement = require("../../code-parser-module/domain/AssignmentStatement");
const VariableDeclaration = require("../../code-parser-module/domain/VariableDeclaration");
const DDGEdge = require("../../data-dependence-graph/domain/DDGEdge");
const _ = require("lodash")
class CFG {

    constructor(nodes) {
        if (nodes){
            this._nodes = nodes;
        } else {
            this._nodes = []
        }
        
    }

    print(){
        let lines = []
        for(let node of this.nodes){
            let targets = node.edges.map(e => e.targetNode.id)
            lines.push(`Node: ${node.id} -> ${targets.join(", ")}`)
        }
        console.log(lines.join("\n"))
    }

    hasEdge(from, to){
        let fromNode = this.getNodeById(from)
        if (!fromNode){
            return false
        }
        return fromNode.hasEdgeTo(to)
    }

    hasExitNode(nodeId){
        let node = this.getNodeById(nodeId)
        if (!node){
            throw new Error('Invalid node Id')
        }
        return node.isExitNode()
    }

    getNodeById(id){
        let result = this.nodes.filter(n => n.id === id)
        if (result){
            return result[0]
        } else {
            return null
        }
    }

    addNode(node){
        this.nodes.push(node);
    }
    

    get nodes() {
        return this._nodes;
    }

    set nodes(value) {
        this._nodes = value;
    }

    getForwardDominanceTree (){
        let fdtNodes = this._nodes.map(node =>{
            return new FDTNode(node.id,null,node._statement,this.getFDTNodeEdges(node));
        });
        return new FDT(fdtNodes);
    }

    getNodesImmediateDominators(){
        let immediateDomMap = {};
        this._nodes.forEach(node =>{
            let nodeDominants = [];
            let remainingCFGNodes = this._nodes.filter(rNode =>rNode._id !== node._id);
            remainingCFGNodes.forEach(rNode => {
                //Y forward dominates X if all paths from X include Y
                let nodeTopology = this.getAllCFGPaths().filter(topology => topology._source === node._id);
                let allNodePathsFromX = nodeTopology.flatMap(t => t._paths);

                if(rNode.dominatesNode(allNodePathsFromX,node)){
                    nodeDominants.push(rNode);
                }
            })

            let immediateNodeDominator = nodeDominants.find(nd =>{
                let restDominants = nodeDominants.filter(elem => elem._id !== nd._id);
                return restDominants.every(rd => {
                    let nodeTopology = this.getAllCFGPaths().filter(topology => topology._source === rd._id);
                    let allNodePathsFromX = nodeTopology.flatMap(t => t._paths);

                    return rd.dominatesNode(allNodePathsFromX,nd)
                })
            })

            immediateDomMap[node._id] = (immediateNodeDominator) ? immediateNodeDominator._id : 0;

        })

        return immediateDomMap
    }
    getFDTNodeEdges(cfgNode){
        let dominatorsMap = this.getNodesImmediateDominators();

        let fdtEdges = []
        for (const key in dominatorsMap) {
            if (dominatorsMap[key] === cfgNode._id) {
                fdtEdges.push( new FDTEdge(cfgNode.id,parseInt(key)));
            }
        }
        // let cfgNodes = this._nodes.filter(node => {
        //     return node._edges.find(edge =>  edge._target === cfgNode.id);
        // });

        return fdtEdges;//cfgNodes.map(node =>   new FDTEdge(cfgNode.id,node.id));
    }

    getAllEdges(){
        return this._nodes.flatMap(node => {
            return node._edges;
        })
    }

    getAllCFGPaths(){
        return new Graph(this._nodes.length).getCFGPaths(this)
    }

    getNodeById(id){
        return this._nodes.find(node => node._id === id);
    }

    getDataDependencyEdgesForNode(fromNode){
        let ddgEdges = [];
        this.getAllCFGPaths().filter(topology => topology._source === fromNode._id).forEach(topology =>{
            this.getVariableDependency(fromNode,this.getNodeById(topology._target),topology._paths).forEach(vd => {

                //Add DDGEdge if it does not exist already
                if(!ddgEdges.some(edge => edge._source === fromNode._id && edge._target === topology._target && vd === edge._dependantVariable)){
                    ddgEdges.push(new DDGEdge(fromNode._id, topology._target, vd))
                }
            })
            // topology._paths.forEach(path => {
            //     this.getVariableDependency(fromNode,this.getNodeById(topology._target),path).forEach(vd => {
            //
            //         //Add DDGEdge if it does not exist already
            //         if(!ddgEdges.some(edge => edge._source === fromNode._id && edge._target === topology._target && vd === edge._dependantVariable)){
            //             ddgEdges.push(new DDGEdge(fromNode._id, topology._target, vd))
            //         }
            //     })
            // })
        });
        return ddgEdges;
    }

    getVariableDependency(fromNode,toNode,paths){
        let sourceNodeUsedVars = fromNode._statement.getUsedVariableNames();
        let destNodeUsedVars = toNode._statement.getUsedVariableNames();

        let sourceNodeDeclaredVar = (fromNode._statement instanceof AssignmentStatement || fromNode._statement instanceof VariableDeclaration)
            ? fromNode._statement.getDefinedVariable() : undefined;
        let destNodeDeclaredVar = (toNode._statement instanceof AssignmentStatement || toNode._statement instanceof VariableDeclaration)
            ? toNode._statement.getDefinedVariable() : undefined;

        let allVars = _.uniq(sourceNodeUsedVars.concat(destNodeUsedVars));
        if(sourceNodeDeclaredVar) allVars = allVars.concat(sourceNodeDeclaredVar);
        if(destNodeDeclaredVar) allVars = allVars.concat(destNodeDeclaredVar);

        let variableDependencyList = []
        /*
            //     * Formal Definition
            //     – Let X and Y be nodes in a CFG. There is a data
            //     dependence from X to Y with respect to a
            //     variable v iff there is a non-null path p from X
            //     to Y with no intervening definition of v and
            //     either:
            //     • X contains a definition of v and Y a use of v;
            //     • X contains a use of v and Y a definition of v; or
            //     • X contains a definition of v and Y a definition of v.
            //                 * */
        for(let i in allVars){
            let variable = allVars[i];
            let nodesAreDataDependent = paths.some(path =>{
                let remainingNodes = path.filter(nodeId => nodeId !== fromNode._id &&  nodeId !== toNode._id).map(nodeId => this.getNodeById(nodeId));
                let hasInterveningDefinition = remainingNodes.some(rNode => {
                    let rNodeDeclaredVar = (rNode._statement instanceof AssignmentStatement || rNode._statement instanceof VariableDeclaration)
                        ? rNode._statement.getDefinedVariable() : undefined;
                    return rNodeDeclaredVar && rNodeDeclaredVar.includes(variable)
                })

                return (!hasInterveningDefinition
                    && (
                        (sourceNodeDeclaredVar && sourceNodeDeclaredVar.includes( variable) && destNodeUsedVars.includes(variable))
                        || (sourceNodeUsedVars.includes(variable) && destNodeDeclaredVar && destNodeDeclaredVar.includes(variable))
                        || (sourceNodeDeclaredVar &&sourceNodeDeclaredVar.includes( variable) && destNodeDeclaredVar && destNodeDeclaredVar.includes(variable))));

            });
            if(nodesAreDataDependent) variableDependencyList.push(variable);

        }

        return (variableDependencyList.length) ? variableDependencyList : [];
    }
}
module.exports = CFG;