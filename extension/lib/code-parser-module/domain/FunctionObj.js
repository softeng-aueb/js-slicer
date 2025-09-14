class FunctionObj {

    constructor(name, args, body, type) {
        this._name = name;
        this._args = args;
        this._body = body;
        this._type = type;
    }


    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get args() {
        return this._args;
    }

    set args(value) {
        this._args = value;
    }

    get body() {
        return this._body;
    }

    set body(value) {
        this._body = value;
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }
}

module.exports = FunctionObj;