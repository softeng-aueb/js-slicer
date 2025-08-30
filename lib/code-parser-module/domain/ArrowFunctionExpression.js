class ArrowFunctionExpression {
    constructor(params, body, isAsync) {
        this._params = params;
        this._body = body;
        this._isAsync = isAsync;
    }

    asText() {
        let paramsStr = "";
        for (let param of this._params) {
            paramsStr = paramsStr.concat(param.asText(), ", ");
        }
        paramsStr = paramsStr.slice(0, -2);

        return `${this._isAsync ? "async " : ""}${`(${paramsStr})`}=>{...}`; //add body info?
    }
}

module.exports = ArrowFunctionExpression;
