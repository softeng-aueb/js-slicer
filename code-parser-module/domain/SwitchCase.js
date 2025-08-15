class SwitchCase {
    constructor(test, consequent) {
        this._test = test;
        this._consequent = consequent;
    }

    get test() {
        return this._test;
    }

    set test(value) {
        this._test = value;
    }

    get consequent() {
        return this._consequent;
    }

    accept(visitor) {
        return visitor.visitSwitchCase(this);
    }
}

module.exports = SwitchCase;
