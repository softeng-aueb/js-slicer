const ConditionalStatement = require("../../code-parser-module/domain/ConditionalStatement");
const LogicalExpression = require("../../code-parser-module/domain/LogicalExpression");
const LoopStatement = require("../../code-parser-module/domain/LoopStatement");
const BinaryExpression = require("../../code-parser-module/domain/BinaryExpression");
const _ = require("lodash");
let CFGEdge = require("../domain/CFGEdge")
const CFGNode = require("../domain/CFGNode");
const ReturnStatement = require("../../code-parser-module/domain/ReturnStatement");

const getNodeEdges = (statementsArr,currStatement, currNodeId) => {
    if (_.isUndefined(statementsArr) || _.isUndefined(currStatement) || _.isUndefined(currNodeId)) {
        throw new Error(`Missing required param.`)
    }
    let foundCurrentStatement = statementsArr.find(st => _.isEqual(st, currStatement))
    if (!foundCurrentStatement) return;

    let hasNextStatement = (_.findIndex(statementsArr, (st) => _.isEqual(st, foundCurrentStatement)) !== -1
        && _.findIndex(statementsArr, (st) => _.isEqual(st, foundCurrentStatement)) <= statementsArr.length - 2);
    if (!hasNextStatement ) return [];
    return [new CFGEdge(currNodeId, currNodeId + 1)];
};

const getBlockNodeEdges = (blockStatementsArr,currStatement, currNodeId, conditionalStatement,statementsArr,initCondition) => {
    if (_.isUndefined(statementsArr) || _.isUndefined(currStatement) || _.isUndefined(currNodeId) || _.isUndefined(blockStatementsArr)) {
        throw new Error(`Missing required param.`)
    }
    let foundCurrentStatement = blockStatementsArr.find(st => _.isEqual(st, currStatement))
    if (!foundCurrentStatement) return;

    let isBlocksLastStatement = (_.findIndex(blockStatementsArr, (st) => _.isEqual(st, foundCurrentStatement)) !== -1
        && _.findIndex(blockStatementsArr, (st) => _.isEqual(st, foundCurrentStatement)) === blockStatementsArr.length - 1)

    let hasNextStatement = (_.findIndex(blockStatementsArr, (st) => _.isEqual(st, foundCurrentStatement)) !== -1
        && _.findIndex(blockStatementsArr, (st) => _.isEqual(st, foundCurrentStatement)) <= blockStatementsArr.length - 2)
        ||  getNextCFGNodeId(statementsArr,conditionalStatement);

    let edges = [];

    if(foundCurrentStatement instanceof ReturnStatement) return []


    if((conditionalStatement instanceof LoopStatement) && isBlocksLastStatement){
        let nodeIds = getLoopStatementNodeIds(conditionalStatement,blockStatementsArr,currNodeId);
        nodeIds.forEach(nodeId => edges.push(new CFGEdge(currNodeId, nodeId)));
        return edges;
    }else if((conditionalStatement instanceof LoopStatement) && !isBlocksLastStatement){
        return getNodeEdges(blockStatementsArr,currStatement,currNodeId)
    }

    if((conditionalStatement instanceof ConditionalStatement) && !isBlocksLastStatement){
        edges.push(new CFGEdge(currNodeId, getNodeEdges(blockStatementsArr,currStatement,currNodeId)));
    }else if((conditionalStatement instanceof ConditionalStatement) && isBlocksLastStatement){
        let initConditionIndex = _.findIndex(statementsArr, (st) => _.isEqual(st, initCondition));
        let isLastStatementOfFunction = initConditionIndex < statementsArr.length - 2;

        let conditionsNodes = getCFGConditionNodes(initCondition,[])
        let currConditionIndex = _.findIndex(conditionsNodes, (cn) => _.isEqual(cn, conditionalStatement));
        let count = 0;
        conditionsNodes.forEach(cn => {
            count = count + getCFGConditionNodesNumber(cn._condition,0)
        })
        count = count + initCondition.getListOfInnerStatements([]).length;//getListOfConditionalInnerStatements([],initCondition).length
        let isLastCondition = currConditionIndex < conditionsNodes.length - 2;

        if(!isLastStatementOfFunction){
            edges.push(new CFGEdge(currNodeId, count+1));
        }
        return edges

        // if(!isLastCondition && isLastStatementOfFunction){
        //     return [];
        // }else{
        //     edges.push(new CFGEdge(currNodeId, currNodeId + 1));
        // }
       // return edges;
    }
    if (hasNextStatement) {
        edges.push(new CFGEdge(currNodeId, getNextCFGNodeId(statementsArr,conditionalStatement)));
        return edges;
    }
    //return [new CFGEdge(currNodeId, currNodeId + 1)];
};

const getLoopStatementNodeIds = (conditionalStatement,blockStatmentsArr,currentNodeId) =>{
    let cfgConditionNodesNumber = getCFGConditionNodesNumber(conditionalStatement._condition,0)
    let lastConditionalNodeId =  currentNodeId - blockStatmentsArr.length;
    let initialConditionalNodeId = lastConditionalNodeId - cfgConditionNodesNumber +1;
    let nodeIds = [];
    for (let i = initialConditionalNodeId; i<initialConditionalNodeId + cfgConditionNodesNumber; i++){
        nodeIds.push(i)
    }

    return nodeIds
}

const getConditionalNodeEdges = (functionStatements, condition, conditionalStatement, currentNodeId, initialNodeId, initCondition) => {
    if (_.isUndefined(conditionalStatement) || _.isUndefined(currentNodeId) || _.isUndefined(condition) || _.isUndefined(initialNodeId)) {
        throw new Error(`Missing required param.`)
    }
    let edges = [];
    edges.push(new CFGEdge(currentNodeId, initialNodeId + getCFGConditionNodesNumber(condition,0), true));

    // let getNextStatement = getNextCFGNodeId(functionStatements,conditionalStatement);
    // if(getNextStatement){
    //     //edges.push(new CFGEdge(currentNodeId, initialNodeId + getNodesBetweenConditions(conditionalStatement,getCFGConditionNodesNumber(condition,0)), false));
    //     edges.push(new CFGEdge(currentNodeId, getNextStatement, false));
    //
    // }

    let initConditionIndex = _.findIndex(functionStatements, (st) => _.isEqual(st, initCondition));
    let isLastStatementOfFunction = initConditionIndex < functionStatements.length - 2;

    let conditionsNodes = getCFGConditionNodes(initCondition,[])
    let currConditionIndex = _.findIndex(conditionsNodes, (cn) => _.isEqual(cn, conditionalStatement));
    let count = 0;
    conditionsNodes.forEach(cn => {
        count = count + getCFGConditionNodesNumber(cn._condition,0)
    })
    let isLastCondition = currConditionIndex == conditionsNodes.length - 2;

    let extraConditions = (getCFGConditionNodesNumber(condition,0) > 1) ? getCFGConditionNodesNumber(condition,0) - 1  : 0
    let innerStatementsNum = undefined;
    if(conditionalStatement instanceof LoopStatement) {
        count = count +  getListOfLoopInnerStatements([],conditionalStatement).length
        edges.push(new CFGEdge(currentNodeId, extraConditions+initialNodeId +count + 1 , false));

    }else if(conditionalStatement instanceof ConditionalStatement){
        edges.push(new CFGEdge(currentNodeId,  currentNodeId + 1 +conditionalStatement.getListOfStatementsPerCondition([],condition).length, false));

    }
//    edges.push(new CFGEdge(currentNodeId, extraConditions+initialNodeId +innerStatementsNum + 1 , false));

    // if(!isLastCondition){
    //     let extraConditions = (getCFGConditionNodesNumber(condition,0) > 1) ? getCFGConditionNodesNumber(condition,0) - 1  : 0
    //     edges.push(new CFGEdge(currentNodeId, extraConditions+initialNodeId +getListOfConditionalInnerStatements([],condition).length + 1 , false));
    // }else{
    //     edges.push(new CFGEdge(currentNodeId, count, false));
    // }
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
    if(currentStatementIndex <= statementsArr.length - 2) {
        let conditionalInnerStatements;
        if (conditionalStatement instanceof LoopStatement) {
            conditionalInnerStatements = getListOfLoopInnerStatements([], conditionalStatement);
        } else if (conditionalStatement instanceof ConditionalStatement){
            conditionalInnerStatements = getListOfConditionalInnerStatements([], conditionalStatement);
        }
        let conditionalInnerStatementsNum = conditionalInnerStatements.length;

        nextCFGNodeID = currentStatementIndex + conditionalInnerStatementsNum;
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

const getCFGConditionNodes = (condition,conditionsList) => {
    if(!condition) return [];
    if (condition instanceof ConditionalStatement) {
        conditionsList.push(condition)
    }
    if (condition._then && (condition._then instanceof ConditionalStatement)) {
        getCFGConditionNodes(condition._then, conditionsList)
    }

    if (condition._alternates && (condition._alternates instanceof ConditionalStatement)) {
        getCFGConditionNodes(condition._alternates, conditionsList)
    }else if(condition && condition._alternates){
        conditionsList.push("else")
    }
    return conditionsList;
};

const getConditionsCFGNodes = (functionStatements, currentNodeId, condition, conditionalStatement, nodes, initCondition) => {
    let initialNodeId = currentNodeId //(currentNodeId === 0) ? currentNodeId + 1 : currentNodeId;
    if (condition instanceof BinaryExpression) {
        // currentNodeId += 1;
        let conditionNode = new CFGNode(currentNodeId, null, condition, getConditionalNodeEdges(functionStatements, condition, conditionalStatement, currentNodeId,initialNodeId,initCondition));
        currentNodeId += 1;
        nodes.push(conditionNode)
    }

    if (condition instanceof LogicalExpression) {
        if (condition._left instanceof BinaryExpression) {
            //currentNodeId += 1;
            let conditionNode = new CFGNode(currentNodeId, null, condition._left, getConditionalNodeEdges(functionStatements ,condition, conditionalStatement, currentNodeId,initialNodeId, initCondition));
            currentNodeId += 1;
            nodes.push(conditionNode)
        } else {
            return getConditionsCFGNodes(functionStatements, initialNodeId, condition._left, conditionalStatement, nodes)
        }

        if (condition._right instanceof BinaryExpression) {
            //currentNodeId += 1;
            let conditionNode = new CFGNode(currentNodeId, null, condition._right, getConditionalNodeEdges(functionStatements, condition, conditionalStatement, currentNodeId,initialNodeId ,initCondition));
            currentNodeId += 1;
            nodes.push(conditionNode)
        } else {
            return getConditionsCFGNodes(functionStatements, initialNodeId, condition._right, conditionalStatement, nodes)
        }

    }

    return nodes;
};

const getConditionalStatementCFGNodes = (functionStatements,statement, counterId, nodes, initCondition) => {
    if(statement.condition){
        let  conditionCFGNodes = getConditionsCFGNodes(functionStatements, counterId,statement.condition,statement,[],initCondition)
        nodes = nodes.concat(conditionCFGNodes);
        counterId +=conditionCFGNodes.length;
    }

    if (statement._then instanceof ConditionalStatement) {
        return getConditionalStatementCFGNodes(functionStatements,statement._then, counterId, nodes, initCondition)
    }else{

        for (let i in statement._then){
            let then = statement._then[i];
            if (then instanceof ConditionalStatement) {
                return getConditionalStatementCFGNodes(functionStatements,then,counterId,nodes, initCondition)
            } else {
                // counterId +=1;
                nodes.push(new CFGNode (counterId,null,then,getBlockNodeEdges(statement._then,then,counterId,statement,functionStatements,initCondition)));
                counterId++;
            }
        }
    }
    if(statement._alternates){
        if (statement._alternates instanceof ConditionalStatement) {
            return getConditionalStatementCFGNodes(functionStatements,statement._alternates, counterId, nodes, initCondition)
        }else{
            //counterId +=1;
            //nodes = nodes.concat(statement._alternates.map(st => new CFGNode (counterId,"else",st,[new CFGEdge(counterId, counterId + 1, true)])));
            //counterId +=1;
            for (let j in statement._alternates){
                let alternate = statement._alternates[j];
                if (alternate instanceof ConditionalStatement) {
                    return getConditionalStatementCFGNodes(functionStatements,alternate,counterId,nodes, initCondition)
                } else {
                    // counterId +=1;
                    nodes.push(new CFGNode (counterId,null,alternate,getBlockNodeEdges(statement._alternates,alternate,counterId,statement,functionStatements,initCondition)));
                    counterId++;
                }
            }
        }
    }

    return {
        conditionalCFGNodes :nodes,
        counter: counterId
    };
};

const getLoopStatementCFGNodes = (functionStatements,statement, counterId, nodes) => {
    if (statement.condition) {
        let loopCFGNodes = getConditionsCFGNodes(functionStatements, counterId, statement.condition, statement, [])
        nodes = nodes.concat(loopCFGNodes);
        counterId += loopCFGNodes.length;
    }

    for (let i in statement._body) {
        let body = statement._body[i];
        if (body instanceof ConditionalStatement) {
            let result =  getConditionalStatementCFGNodes(functionStatements, body, counterId, nodes, body)
            nodes = result.conditionalCFGNodes;
            counterId = result.counter;
        }else if(body instanceof LoopStatement){
            let result =  getLoopStatementCFGNodes(functionStatements, body, counterId, nodes)
            nodes =result.loopCFGNodes;
            counterId = result.counter;
        }else {
            // counterId +=1;
            nodes.push(new CFGNode (counterId,null,body,getBlockNodeEdges(statement._body,body,counterId,statement,functionStatements)));
            counterId +=1;
        }
    }
    return {
        loopCFGNodes :nodes,
        counter: counterId
    };
};

const getListOfLoopInnerStatements = (statements,lStatement) => {
    //statements.push(lStatement._condition)
    if (lStatement._body instanceof ConditionalStatement || lStatement._body instanceof LoopStatement) {
        lStatement._body.getListOfInnerStatements(statements)
    }else{
        for (let i in lStatement._body){
            let statement = lStatement._body[i];
            if (statement instanceof ConditionalStatement || statement instanceof LoopStatement) {
                getListOfLoopInnerStatements(statements, statement)
            } else {
                statements = statements.concat(statement);
            }
        }
    }
    return statements;
}

const getListOfConditionalInnerStatements = (statements,cStatement) =>{
    if(!cStatement) return [];
    //statements.push(cStatement._condition)
    if (cStatement._then instanceof ConditionalStatement || cStatement._then instanceof LoopStatement) {
        cStatement._then.getListOfInnerStatements(statements)
    }else{
        for (let i in cStatement._then){
            let statement = cStatement._then[i];
            if (statement instanceof ConditionalStatement || statement instanceof LoopStatement) {
                getListOfConditionalInnerStatements(statements, statement)
            } else {
                statements = statements.concat(statement);
            }
        }
    }
    if (cStatement._alternates instanceof ConditionalStatement || cStatement._alternates instanceof LoopStatement) {
        cStatement._alternates.getListOfInnerStatements(statements)
    }else{
        for (let i in cStatement._alternates){
            let statement = cStatement._alternates[i];
            if (statement instanceof ConditionalStatement || statement instanceof ConditionalStatement) {
                getListOfConditionalInnerStatements(statements, statement._then)
            } else {
                statements = statements.concat(statement);
            }
        }
    }
    return statements;
}

module.exports = {
    getNodeEdges,
    getConditionalStatementCFGNodes,
    getLoopStatementCFGNodes,
    getCFGConditionNodesNumber
}
