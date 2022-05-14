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

}

module.exports = FunctionBody;