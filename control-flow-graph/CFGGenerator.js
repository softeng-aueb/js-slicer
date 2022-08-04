const FunctionObj = require("../code-parser-module/domain/FunctionObj");
const ConditionalStatement = require("../code-parser-module/domain/ConditionalStatement");
const {getNodeEdges, getConditionalStatementCFGNodes,getLoopStatementCFGNodes} = require("./helpers/cfgNodesHelpers")
const LoopStatement = require("../code-parser-module/domain/LoopStatement");
const CFGNode = require("./domain/CFGNode");
const CFG = require("./domain/CFG");

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
           } else{
               // counterId++;
               return new CFGNode (counterId,null,st,getNodeEdges(functionObj.body,st,counterId))
           }
           counterId++;
       });

        return new CFG(nodes);
    }
}
module.exports = CFGGenerator;