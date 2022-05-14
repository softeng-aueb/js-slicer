class VariableDeclaration {

    constructor(type,name,value) {
        this._type = type;
        this._name = name;
        this._value = value;
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

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }
}

module.exports = VariableDeclaration;