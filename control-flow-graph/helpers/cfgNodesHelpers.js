const ConditionalStatement = require("../../code-parser-module/domain/ConditionalStatement");
const LogicalExpression = require("../../code-parser-module/domain/LogicalExpression");
const BinaryExpression = require("../../code-parser-module/domain/BinaryExpression");
const _ = require("lodash");
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

const getConditionalNodeEdges = (condition, conditionalStatement, currentNodeId, initialNodeId) => {
    if (_.isUndefined(conditionalStatement) || _.isUndefined(currentNodeId) || _.isUndefined(condition) || _.isUndefined(initialNodeId)) {
        throw new Error(`Missing required param.`)
    }
    let edges = [];
    edges.push(new CFGEdge(currentNodeId, initialNodeId + getCFGConditionNodesNumber(condition,0)));

    edges.push(new CFGEdge(currentNodeId, initialNodeId + getNodesBetweenConditions(conditionalStatement,getCFGConditionNodesNumber(condition,0))));
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

const getCFGConditionNodesNumber = (condition,num) => {
    if (condition instanceof BinaryExpression) {
       num = num + 1;
    }
    if (condition instanceof LogicalExpression) {
        if (condition._left instanceof BinaryExpression) {
           num = num + 1;
        } else {
            return getCFGConditionNodesNumber(condition._left, num)
        }

        if (condition._right instanceof BinaryExpression) {
            num = num + 1;
        } else {
            return getCFGConditionNodesNumber(condition._right, num)
        }
    }
    return num;
};

const getConditionsCFGNodes = (currentNodeId, condition, conditionalStatement, nodes) => {
    let initialNodeId = (currentNodeId === 0) ? currentNodeId + 1 : currentNodeId;
    if (condition instanceof BinaryExpression) {
        currentNodeId += 1;
        let conditionNode = new CFGNode(currentNodeId, null, condition, getConditionalNodeEdges(condition, conditionalStatement, currentNodeId,initialNodeId));
        nodes.push(conditionNode)
    }

    if (condition instanceof LogicalExpression) {
        if (condition._left instanceof BinaryExpression) {
            currentNodeId += 1;
            let conditionNode = new CFGNode(currentNodeId, null, condition._left, getConditionalNodeEdges(condition, conditionalStatement, currentNodeId,initialNodeId));
            nodes.push(conditionNode)
        } else {
            return getConditionsCFGNodes(initialNodeId, condition._left, conditionalStatement, nodes)
        }

        if (condition._right instanceof BinaryExpression) {
            currentNodeId += 1;
            let conditionNode = new CFGNode(currentNodeId, null, condition._right, getConditionalNodeEdges(condition, conditionalStatement, currentNodeId,initialNodeId));
            nodes.push(conditionNode)
        } else {
            return getConditionsCFGNodes(initialNodeId, condition._right, conditionalStatement, nodes)
        }

    }

    return nodes;
};

const getConditionalStatementCFGNodes = (functionStatements,statement, counterId, nodes) => {
    if(statement.condition){
        let  conditionCFGNodes = getConditionsCFGNodes(counterId,statement.condition,statement,[])
        nodes = nodes.concat(conditionCFGNodes);
        counterId +=conditionCFGNodes.length;
    }

    if (statement._then instanceof ConditionalStatement) {
        return getConditionalStatementCFGNodes(functionStatements,statement._then, counterId, nodes)
    }else{

        for (let i in statement._then){
            let then = statement._then[i];
            if (then instanceof ConditionalStatement) {
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
        counterId +=1;
        nodes = nodes.concat(statement._alternates.map(st => new CFGNode (counterId,"else",st,new CFGEdge(counterId, counterId + 1))));

        for (let j in statement._alternates){
            let alternate = statement._alternates[j];
            if (alternate instanceof ConditionalStatement) {
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
