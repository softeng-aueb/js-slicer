class Identifier {
    constructor(name) {
        this._name = name;
        this._uniqueText;
    }

    get name() {
        return this._name;
    }

    get uniqueText() {
        return this._uniqueText;
    }

    set uniqueText(text) {
        this._uniqueText = text;
    }

    set name(value) {
        this._name = value;
    }

    accept(visitor) {
        visitor.visitIdentifier(this);
    }
    asText() {
        //unique text is used when an identifier is used in a switch statement which
        //is shown without any proper indication and can cause confusion to the user
        return this._uniqueText ? this._uniqueText : this._name;
    }
}
module.exports = Identifier;
