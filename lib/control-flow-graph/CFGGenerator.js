const FunctionObj = require("../code-parser-module/domain/FunctionObj");
const ConditionalStatement = require("../code-parser-module/domain/ConditionalStatement");
const { getNodeEdges, getConditionalStatementCFGNodes, getLoopStatementCFGNodes } = require("./helpers/cfgNodesHelpers");
const LoopStatement = require("../code-parser-module/domain/LoopStatement");
const CFGNode = require("./domain/CFGNode");
const CFG = require("./domain/CFG");
const ReturnStatement = require("../code-parser-module/domain/ReturnStatement");
const CFGEdge = require("./domain/CFGEdge");
const CFGVisitor = require("./CFGVisitor");
const BlockStatement = require("../code-parser-module/domain/BlockStatement");
const BasicBlock = require("./domain/BasicBlock");

class CFGGenerator {
    static generateCfg(functionObj) {
        let counterId = 1;
        if (!functionObj && !functionObj instanceof FunctionObj) {
            throw new Error(`Missing required param.`);
        }

        let nodes = functionObj.body.flatMap((st) => {
            if (st instanceof ConditionalStatement) {
                const { conditionalCFGNodes, counter } = getConditionalStatementCFGNodes(functionObj.body, st, counterId, [], st);
                counterId = counter;
                return conditionalCFGNodes;
            } else if (st instanceof LoopStatement) {
                const { loopCFGNodes, counter } = getLoopStatementCFGNodes(functionObj.body, st, counterId, [], st);
                counterId = counter;
                return loopCFGNodes;
            } else if (st instanceof ReturnStatement) {
                // counterId++;
                let cfgNode = new CFGNode(counterId, null, st, []);
                counterId += 1;
                return cfgNode;
            } else {
                // counterId++;
                let cfgNode = new CFGNode(counterId, null, st, getNodeEdges(functionObj.body, st, counterId));
                counterId += 1;
                return cfgNode;
            }
        });

        nodes.unshift(new CFGNode(0, null, "ENTRY", [new CFGEdge(0, 1)]));
        return new CFG(nodes);
    }

    static generateCfg2(functionObj, usesBasicBlocks = false) {
        let visitor = new CFGVisitor(false);
        let statements = functionObj.body;

        let unfinishedExitNodes = visitor.visitBlockStatement(new BlockStatement(statements));
        let cfg = visitor.cfg;

        // Add exit node for return jumps
        let exitNode = new CFGNode(visitor._id, null, null, [], null);
        for (const n of visitor._returnExitStack) {
            n.addOutgoingEdge(exitNode);
            exitNode.addParent(n);
        }
        cfg.addNode(exitNode);
        // Add edges from final nodes that are not return nodes
        if (unfinishedExitNodes) unfinishedExitNodes.addNextNode(exitNode);

        // Create Basic Block based cfg if requested
        if (!usesBasicBlocks) return cfg;
        return this.constructBBCfg(cfg);
    }

    static constructBBCfg(cfg) {
        let BBcfg = new CFG();
        let BBId = 1;
        let currentBB = new BasicBlock(BBId++);
        BBcfg.addNode(currentBB);
        let traversalNodes = [cfg.getNodeById(1)];
        let nodesFound = [cfg.getNodeById(1)];
        // Create the basic blocks of the graph, connect and relabel to match order later
        while (traversalNodes.length > 0) {
            let currentNode = traversalNodes.pop();
            let nextNodes = currentNode.nextNodes(nodesFound);
            traversalNodes.push(...nextNodes);
            nodesFound.push(...nextNodes);
            // If node is a jump target, conclude current BB, start and include in next BB.
            if (cfg.isJumpTargetNode(currentNode)) {
                currentBB = new BasicBlock(BBId++);
                currentBB.addNode(currentNode);
                BBcfg.addNode(currentBB);
            }
            // If node is a continuous node, add to current BB
            // If node is before a jump, include in current BB, next node will start new BB
            if (currentNode.isJumpNode() || !cfg.isJumpTargetNode(currentNode)) {
                currentBB.addNode(currentNode);
            }
        }

        // Connect the basic blocks of the graph based on the nodes inside
        for (let bb of BBcfg.nodes) {
            for (let otherBB of BBcfg.nodes) {
                if (bb != otherBB) {
                    let edgeCondition = bb.hasEdgeToBlock(otherBB);
                    if (edgeCondition !== null) {
                        bb.addOutgoingEdge(otherBB, edgeCondition);
                    }
                }
            }
        }

        CFGGenerator.correctBasicBlockOrdering(BBcfg);
        return BBcfg;
    }

    static correctBasicBlockOrdering(cfg) {
        let cfgNodes = [...cfg.nodes];
        cfgNodes.sort((block1, block2) => block1.nodes[0].id - block2.nodes[0].id);
        // Labels match the correct order
        for (let i = 1; i <= cfgNodes.length; i++) {
            cfgNodes[i - 1].label = i;
        }

        // Ids now follow the labels in correct ordering
        for (let node of cfgNodes) {
            node.id = node.label;
        }

        // correct cfg issues with using labels as ids in test has edge
        return cfg;
    }
}
module.exports = CFGGenerator;
