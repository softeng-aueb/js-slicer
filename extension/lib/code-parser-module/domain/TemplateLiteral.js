class TemplateLiteral {
    constructor(quasis, expressions) {
        this.quasis = quasis;
        this.expressions = expressions;
    }

    asText() {
        let returnStr = "";
        let components = [...this.quasis].concat([...this.expressions]);

        components = components.sort((a, b) => {
            if (a.loc.start.line != b.loc.start.line) {
                return a.loc.start.line - b.loc.start.line;
            } else {
                return a.loc.start.column - b.loc.start.column;
            }
        });

        for (let c of components) {
            if (c && c.value) returnStr += c.value.raw ?? "";
            else if (c && c.expression) {
                const exprText = c.expression.asText();
                returnStr += `\$\{${exprText}\}`;
            }
        }
        return `\`${returnStr}\``;
    }
}

module.exports = TemplateLiteral;
