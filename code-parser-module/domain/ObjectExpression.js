class ObjectExpression{

    constructor(properties) {
        this._properties = properties;
    }

    get properties() {
        return this._properties;
    }

    set properties(value) {
        this._properties = value;
    }
}
module.exports = ObjectExpression;