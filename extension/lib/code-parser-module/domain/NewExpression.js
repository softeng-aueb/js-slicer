class NewExpression {
    constructor(callee, args) {
        this._callee = callee;
        this._args = args;
    }

    get callee() {
        return this._callee;
    }
    get args() {
        return this._args;
    }

    asText() {
        let str = "";
        for (let arg of this._args) {
            str = str.concat(arg.asText(), ", ");
        }
        str = str.slice(0, -2);

        return `new ${this.callee.asText()}(${str})`;
    }

    accept(visitor) {
        visitor.visitNewExpression(this);
    }
}
module.exports = NewExpression;
