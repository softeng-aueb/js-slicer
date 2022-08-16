const FunctionObj = require("../code-parser-module/domain/FunctionObj");
const ConditionalStatement = require("../code-parser-module/domain/ConditionalStatement");
const {getNodeEdges, getConditionalStatementCFGNodes,getLoopStatementCFGNodes} = require("./helpers/cfgNodesHelpers")
const LoopStatement = require("../code-parser-module/domain/LoopStatement");
const CFGNode = require("./domain/CFGNode");
const CFG = require("./domain/CFG");
const ReturnStatement = require("../code-parser-module/domain/ReturnStatement");

class CFGGenerator {

    static generateCfg(functionObj){
        let counterId = 0;
        if(!functionObj && !functionObj instanceof FunctionObj){
            throw new Error(`Missing required param.`)
        }

       let nodes = functionObj.body.flatMap(st => {
           if(st instanceof ConditionalStatement){
               const {conditionalCFGNodes, counter} = getConditionalStatementCFGNodes(functionObj.body,st,counterId,[]);
               counterId = counter;
               return  conditionalCFGNodes;
           } else if(st instanceof LoopStatement){
               const {loopCFGNodes, counter} = getLoopStatementCFGNodes(functionObj.body,st,counterId,[]);
               counterId = counter;
               return  loopCFGNodes;
           } else if(st instanceof ReturnStatement){
               // counterId++;
               let cfgNode = new CFGNode (counterId,null,st,[])
               counterId+=1;
               return  cfgNode;
           }else{
               // counterId++;
               let cfgNode = new CFGNode (counterId,null,st,getNodeEdges(functionObj.body,st,counterId))
               counterId+=1;
               return  cfgNode;
           }

       });

        return new CFG(nodes);
    }
}
module.exports = CFGGenerator;