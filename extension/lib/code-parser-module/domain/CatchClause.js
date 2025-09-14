class CatchClause {
    constructor(param, body) {
        this._param = param;
        this._body = body;
    }

    get param() {
        return this._param;
    }

    get body() {
        return this._body;
    }
}
module.exports = CatchClause;
