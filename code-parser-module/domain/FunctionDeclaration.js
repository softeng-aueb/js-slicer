class FunctionDeclaration {
    constructor(id, params, body, isAsync, isGenerator) {
        this._id = id;
        this._params = params;
        this._body = body;
        this._isAsync = isAsync;
        this._isGenerator = isGenerator;
    }

    accept(visitor) {
        visitor.visitFunctionDeclaration(this);
    }

    asText() {
        let paramsStr = "";
        for (let param of this._params) {
            paramsStr = paramsStr.concat(param.asText(), ", ");
        }
        paramsStr = paramsStr.slice(0, -2);
        return `${this._isAsync ? "async " : ""}function${this._isGenerator ? "*" : ""} ${this._id?.asText()}(${paramsStr}){...}`; //add body info?
    }
}
module.exports = FunctionDeclaration;
