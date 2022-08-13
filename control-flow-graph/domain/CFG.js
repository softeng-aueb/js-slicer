const FDTNode = require("../../forward-dominance-tree/domain/FDTNode");
const FDTEdge = require("../../forward-dominance-tree/domain/FDTEdge");
const FDT = require("../../forward-dominance-tree/domain/FDT");
const {getCFGPaths} = require("../../utils/graphUtils");
const AssignmentStatement = require("../../code-parser-module/domain/AssignmentStatement");
const VariableDeclaration = require("../../code-parser-module/domain/VariableDeclaration");
const DDGEdge = require("../../data-dependence-graph/domain/DDGEdge");
const _ = require("lodash")
class CFG {

    constructor(nodes) {
        this._nodes = nodes;
    }

    get nodes() {
        return this._nodes;
    }

    set nodes(value) {
        this._nodes = value;
    }

    getForwardDominanceTree (){
        let reversedNodes = this._nodes.slice().reverse();
        let fdtNodes = reversedNodes.map(node =>{
            return new FDTNode(node.id,null,node._statement,this.getFDTNodeEdges(node));
        });
        return new FDT(fdtNodes);
    }

    getFDTNodeEdges(cfgNode){
        let cfgNodes = this._nodes.filter(node => {
            return node._edges.find(edge =>  edge._target === cfgNode.id);
        });

        return cfgNodes.map(node =>   new FDTEdge(cfgNode.id,node.id));
    }

    getAllEdges(){
        return this._nodes.flatMap(node => {
            return node._edges;
        })
    }

    getAllCFGPaths(){
        return getCFGPaths(this);
    }

    getNodeById(id){
        return this._nodes.find(node => node._id === id);
    }

    getDataDependencyEdgesForNode(fromNode){
        let ddgEdges = [];
        this.getAllCFGPaths().filter(topology => topology._source === fromNode._id).forEach(topology =>{
           topology._paths.forEach(path => {
               this.getVariableDependency(fromNode,this.getNodeById(topology._target),path).forEach(vd => {

                   //Add DDGEdge if it does not exist already
                   if(!ddgEdges.some(edge => edge._source === fromNode._id && edge._target === topology._target && vd === edge._dependantVariable)){
                       ddgEdges.push(new DDGEdge(fromNode._id, topology._target, vd))
                   }
               })
           })
        });
        return ddgEdges;
    }

    getVariableDependency(fromNode,toNode,path){
        let sourceNodeUsedVars = fromNode._statement.getUsedVariableNames();
        let destNodeUsedVars = toNode._statement.getUsedVariableNames();

        let sourceNodeDeclaredVar = (fromNode._statement instanceof AssignmentStatement || fromNode._statement instanceof VariableDeclaration)
            ? fromNode._statement.getDefinedVariable() : undefined;
        let destNodeDeclaredVar = (toNode._statement instanceof AssignmentStatement || toNode._statement instanceof VariableDeclaration)
            ? toNode._statement.getDefinedVariable() : undefined;

        let allVars = _.uniq(sourceNodeUsedVars.concat(destNodeUsedVars));
        if(sourceNodeDeclaredVar) allVars.push(sourceNodeDeclaredVar);
        if(destNodeDeclaredVar) allVars.push(destNodeDeclaredVar);

        let remainingNodes = path.filter(nodeId => nodeId !== fromNode._id &&  nodeId !== toNode._id).map(nodeId => this.getNodeById(nodeId));

        let variableDependencyList = []
        for(let i in allVars){
            let variable = allVars[i];
            let hasInterveningDefinition = remainingNodes.some(rNode => {
                let rNodeDeclaredVar = (rNode._statement instanceof AssignmentStatement || rNode._statement instanceof VariableDeclaration)
                    ? rNode._statement.getDefinedVariable() : undefined;
                return rNodeDeclaredVar === variable
            })

            /*
            * Formal Definition
            – Let X and Y be nodes in a CFG. There is a data
            dependence from X to Y with respect to a
            variable v iff there is a non-null path p from X
            to Y with no intervening definition of v and
            either:
            • X contains a definition of v and Y a use of v;
            • X contains a use of v and Y a definition of v; or
            • X contains a definition of v and Y a definition of v.
                        * */
            if(!hasInterveningDefinition
                && (
                    (sourceNodeDeclaredVar && sourceNodeDeclaredVar === variable && destNodeUsedVars.includes(variable))
                    || (sourceNodeUsedVars.includes(variable) && destNodeDeclaredVar && destNodeDeclaredVar === variable)
                    || (sourceNodeDeclaredVar && sourceNodeDeclaredVar === variable && destNodeDeclaredVar && destNodeDeclaredVar === variable))){

                variableDependencyList.push(variable);

            }
        }

        return (variableDependencyList.length) ? variableDependencyList : [];
    }
}
module.exports = CFG;