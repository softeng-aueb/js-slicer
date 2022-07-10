const ConditionalStatement = require("../../code-parser-module/domain/ConditionalStatement");
const LoopStatement = require("../../code-parser-module/domain/LoopStatement");
const _ = require("lodash");
const FunctionBody = require("../../code-parser-module/domain/FunctionBody");
let CFGEdge = require("../domain/CFGEdge")
const CFGNode = require("../domain/CFGNode");

const getNodeEdges = (statementsArr,currStatement, currNodeId) => {
    if (_.isUndefined(statementsArr) || _.isUndefined(currStatement) || _.isUndefined(currNodeId)) {
        throw new Error(`Missing required param.`)
    }
    let foundCurrentStatement = statementsArr.find(st => _.isEqual(st, currStatement))
    if (!foundCurrentStatement) return;

    let hasNextStatement = (_.findIndex(statementsArr, (st) => _.isEqual(st, foundCurrentStatement)) !== -1
        && _.findIndex(statementsArr, (st) => _.isEqual(st, foundCurrentStatement)) <= statementsArr.length - 2);
    if (!hasNextStatement ) return new CFGEdge(currNodeId);
    return new CFGEdge(currNodeId, currNodeId + 1)
};

const getBlockNodeEdges = (blockStatementsArr,currStatement, currNodeId, conditionalStatement,statementsArr) => {
    if (_.isUndefined(statementsArr) || _.isUndefined(currStatement) || _.isUndefined(currNodeId) || _.isUndefined(blockStatementsArr)) {
        throw new Error(`Missing required param.`)
    }
    let foundCurrentStatement = blockStatementsArr.find(st => _.isEqual(st, currStatement))
    if (!foundCurrentStatement) return;

    let hasNextStatement = (_.findIndex(blockStatementsArr, (st) => _.isEqual(st, foundCurrentStatement)) !== -1
        && _.findIndex(blockStatementsArr, (st) => _.isEqual(st, foundCurrentStatement)) <= blockStatementsArr.length - 2)
        ||  getNextCFGNodeId(statementsArr,conditionalStatement);
    if (!hasNextStatement) return new CFGEdge(currNodeId, getNextCFGNodeId(statementsArr,conditionalStatement));
    return new CFGEdge(currNodeId, currNodeId + 1)
};

const getConditionalNodeEdges = (conditionalStatement, currentNodeId) => {
    if (_.isUndefined(conditionalStatement) || _.isUndefined(currentNodeId)) {
        throw new Error(`Missing required param.`)
    }
    let edges = [];
    edges.push(new CFGEdge(currentNodeId, currentNodeId + 1));

    edges.push(new CFGEdge(currentNodeId, currentNodeId + getNodesBetweenConditions(conditionalStatement,0) + 1));
    return edges
};

const getNextCFGNodeId = (statementsArr,conditionalStatement) => {
    if (_.isUndefined(statementsArr) || _.isUndefined(conditionalStatement)) {
        throw new Error(`Missing required param.`)
    }
    let nextCFGNodeID;
    let foundCurrentStatement = statementsArr.find(st => _.isEqual(st, conditionalStatement))
    if (!foundCurrentStatement) return;

    let currentStatementIndex = _.findIndex(statementsArr, (st) => _.isEqual(st, foundCurrentStatement));
    if(currentStatementIndex <= statementsArr.length - 2){
        let currentStatementId = currentStatementIndex + 1;
        let conditionalInnerStatements = conditionalStatement.getListOfInnerStatements([]);
        let conditionalInnerStatementsNum = conditionalInnerStatements.length;

        nextCFGNodeID = currentStatementId + conditionalInnerStatementsNum;
    }
    return nextCFGNodeID
};
const getNodesBetweenConditions = (conditionalStatement,numberOfNodes) => {
    if (_.isUndefined(conditionalStatement)) {
        throw new Error(`Missing required param.`)
    }
    if(Array.isArray(conditionalStatement._then)){
        numberOfNodes += conditionalStatement._then.length;
    }
    if(conditionalStatement._then instanceof ConditionalStatement){
        numberOfNodes += getNodesBetweenConditions(conditionalStatement._then,numberOfNodes)
    }

    return numberOfNodes;
};

const getConditionalStatementCFGNodes = (functionStatements,statement, counterId, nodes) => {
    if(statement.condition){
        counterId +=1;
        let conditionNode = new CFGNode(counterId, null, statement.condition, getConditionalNodeEdges(statement,counterId));
        nodes.push(conditionNode)
    }

    if (statement._then instanceof ConditionalStatement) {
        return getConditionalStatementCFGNodes(functionStatements,statement._then, counterId, nodes)
    }else{

        for (let i in statement._then){
            let then = statement._then[i];
            if (then instanceof ConditionalStatement) {
                //counterId +=1;
                return getConditionalStatementCFGNodes(functionStatements,then,counterId,nodes)
            } else {
                counterId +=1;
                nodes.push(new CFGNode (counterId,null,then,getBlockNodeEdges(statement._then,then,counterId,statement,functionStatements)));
            }
        }
    }
    if (statement._alternates instanceof ConditionalStatement) {
        return getConditionalStatementCFGNodes(functionStatements,statement._alternates, counterId, nodes)
    }else{
        //else case
        counterId +=1;
        nodes = nodes.concat(statement._alternates.map(st => new CFGNode (counterId,"else",st,new CFGEdge(counterId, counterId + 1))));

        for (let j in statement._alternates){
            let alternate = statement._alternates[j];
            if (alternate instanceof ConditionalStatement) {
                //counterId +=1;
                return getConditionalStatementCFGNodes(functionStatements,alternate,counterId,nodes)
            } else {
                counterId +=1;
                nodes.push(new CFGNode (counterId,null,alternate,getBlockNodeEdges(statement._alternates,alternate,counterId,statement,functionStatements)));
            }
        }
    }
    return {
        conditionalCFGNodes :nodes,
        counter: counterId
    };
};

module.exports = {
    getNodeEdges,
    getConditionalStatementCFGNodes
}
