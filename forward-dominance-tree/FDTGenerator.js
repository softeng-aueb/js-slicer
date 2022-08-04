const CFG = require("../control-flow-graph/domain/CFG");

class FDTGenerator{

    static generateFDT(cfg){
        if(!cfg || !cfg instanceof CFG){
            throw new Error(`Missing required param.`)
        }

       return cfg.getForwardDominanceTree();
    }

}

module.exports = FDTGenerator;