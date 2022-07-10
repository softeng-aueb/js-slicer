class FunctionBody {

    constructor(body) {
        this._body = body;
    }


    get body() {
        return this._body;
    }

    set body(value) {
        this._body = value;
    }

    getStatementByIndex(index){
        return (this._body && Array.isArray(this._body ) && this._body.length > 0) ? this._body[index] : null;
    }
}

module.exports = FunctionBody;