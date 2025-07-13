const fs = require("fs");
const BasicBlock = require("./domain/BasicBlock");

class CFGVisualizer {
    constructor(cfg, filename) {
        this.cfg = cfg;
        this.filename = filename;
    }

    exportToDot() {
        this.exportCFGToDot(this.cfg, this.filename);
    }

    exportCFGToDot(cfg, filename) {
        let dot = CFGVisualizer.writeCFGToDot(cfg);
        fs.writeFileSync(`./output/cfg-${filename}.dot`, dot);
    }

    static writeCFGToDot(cfg) {
        let digraph = `digraph G {
          rankdir=TB;
          ranksep="0.2 equally";
          fontname="sans-serif";
          rotate="0";
          orientation="portrait";
          landscape="true";
          penwidth="0.1";
          edge [comment="Wildcard edge", 
                fontname="sans-serif", 
                fontsize=10, 
                colorscheme="blues3", 
                color=2, 
                fontcolor=3];
          node [fontname="serif", 
                fontsize=13, 
                fillcolor="1", 
                colorscheme="blues4", 
                color="2", 
                fontcolor="4", 
                style="filled"];`;

        for (let node of cfg.nodes) {
            if (node instanceof BasicBlock) {
                let label = node.nodes.map((n) => n.id).join("\\l") + "\\l";
                digraph += `\t"${node._id}" [label="${label}"];\n`;
            } else {
                digraph += `\t"${node.label}";\n`;
            }
        }
        for (let node of cfg.nodes) {
            for (let edge of node.edges) {
                digraph += `\t"${edge.sourceNode.label}" -> "${edge.targetNode.label}"`;
                let properties = [];
                if (edge.condition === true || edge.condition === false) {
                    properties.push(`label="${edge.condition}"`);
                }
                digraph += `[${properties.join(", ")}];\n`;
            }
        }
        digraph += "}";
        return digraph;
    }
}

module.exports = CFGVisualizer;
