class Identifier{
    constructor(name) {
        this._name = name;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    accept(visitor){
        
    }
}
module.exports = Identifier;