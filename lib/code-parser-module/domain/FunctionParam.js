class FunctionParam{

    constructor(type,name) {
        this._type = type;
        this._name = name;
    }


    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }
}

module.exports = FunctionParam;