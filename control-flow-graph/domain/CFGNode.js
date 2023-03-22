const CFGEdge = require("./CFGEdge");

class CFGNode {

    constructor(id,executionCondition,statement,edges, parent) {
        this._id = id;
        this._executionCondition = executionCondition
        this._statement = statement;
        this._edges = edges;
        this._parent = parent;
    }


    addOutgoingEdge(targetNode, condition){
        console.log(`Adding edge to ${targetNode.id}`)
        let edge = new CFGEdge(this.id, targetNode.id, condition, 
            this, targetNode);
        this.edges.push(edge)
    }

    get parent(){
        return this._parent;
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get executionCondition() {
        return this._executionCondition;
    }

    set executionCondition(value) {
        this._executionCondition = value;
    }

    get statement() {
        return this._statement;
    }

    set statement(value) {
        this._statement = value;
    }

    get edges() {
        return this._edges;
    }

    set edges(value) {
        this._edges = value;
    }

    isDependantNode (cfg) {
        return cfg.find(node =>  node._edges.find(edge => edge._condition === true && edge._target === this._id));
    }

    dominatesNode(paths,node){
        if(this._id === node._id){
            return true;
        }
        if(this._id !== node._id && paths.every(path => path.includes(this._id))){
            return true;
        }
        return false;

    }
}
module.exports = CFGNode;