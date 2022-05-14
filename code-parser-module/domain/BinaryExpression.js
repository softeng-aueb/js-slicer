class BinaryExpression{
    constructor(left,right,operator) {
        this._left = left;
        this._right = right;
        this._operator = operator;
    }


    get left() {
        return this._left;
    }

    set left(value) {
        this._left = value;
    }

    get right() {
        return this._right;
    }

    set right(value) {
        this._right = value;
    }

    get operator() {
        return this._operator;
    }

    set operator(value) {
        this._operator = value;
    }
}

module.exports = BinaryExpression;