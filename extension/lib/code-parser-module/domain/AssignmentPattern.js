class AssignmentPattern {
    constructor(left, right) {
        this._left = left;
        this._right = right;
    }

    asText() {
        return `${this._left.asText()}=${this._right.asText()}`;
    }
}
module.exports = AssignmentPattern;
