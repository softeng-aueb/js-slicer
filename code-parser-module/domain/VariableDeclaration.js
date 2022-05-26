class VariableDeclaration {

    constructor(type,names,value) {
        this._type = type;
        this._names = names;
        this._value = value;
    }


    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }

    get names() {
        return this._names;
    }

    set names(value) {
        this._names = value;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }
}

module.exports = VariableDeclaration;