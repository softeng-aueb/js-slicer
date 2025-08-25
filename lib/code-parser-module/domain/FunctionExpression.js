class FunctionExpression {
    constructor(params, body, isAsync, isGenerator) {
        this._params = params;
        this._body = body;
        this._isAsync = isAsync;
        this._isGenerator = isGenerator;
    }

    asText() {
        let paramsStr = "";
        for (let param of this._params) {
            paramsStr = paramsStr.concat(param.asText(), ", ");
        }
        paramsStr = paramsStr.slice(0, -2);
        return `${this._isAsync ? "async " : ""}function${this._isGenerator ? "*" : ""} (${paramsStr}){...}`; //add body info?
    }
}

module.exports = FunctionExpression;
