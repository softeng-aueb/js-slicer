class FunctionCall {

    constructor(name, args) {
        this._name = name;
        this._args = args;
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

}

module.exports = FunctionCall;