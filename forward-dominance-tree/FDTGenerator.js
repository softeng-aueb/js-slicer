const CFG = require("../control-flow-graph/domain/CFG");
const Parser = require("../code-parser-module/Parser");
const CFGGenerator = require("../control-flow-graph/CFGGenerator")

class FDTGenerator{

    static generateFDT(cfg){
        if(!cfg || !cfg instanceof CFG){
            throw new Error(`Missing required param.`)
        }

       return cfg.getForwardDominanceTree();
    }

}

let func = Parser.parse([
    "(a, b) => {",
    "while (y>0 && y>1){ ",
    " y=y+1",
    "}" ,
    " return x",
    "}"
]);

FDTGenerator.generateFDT(CFGGenerator.generateCfg(func))

module.exports = FDTGenerator;