class SwitchStatement {
    constructor(discriminant, cases) {
        this._discriminant = discriminant;
        this._cases = cases;
    }

    get discriminant() {
        return this._discriminant;
    }

    get cases() {
        return this._cases;
    }

    set discriminant(val) {
        this._discriminant = val;
    }

    set cases(val) {
        this._cases = val;
    }

    accept(visitor, isCalledAsFirstOnDoWhile = false) {
        return visitor.visitSwitchStatement(this, isCalledAsFirstOnDoWhile);
    }
}

module.exports = SwitchStatement;
