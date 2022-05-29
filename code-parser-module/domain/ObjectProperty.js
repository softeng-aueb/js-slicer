class ObjectProperty {
    constructor(key,value) {
        this._key = key;
        this._value = value;
    }


    get key() {
        return this._key;
    }

    set key(value) {
        this._key = value;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }
}
module.exports = ObjectProperty;