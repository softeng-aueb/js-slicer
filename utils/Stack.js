class Stack {

    constructor(){
        this._elements = []
    }

    pop(){
        return this._elements.pop()
    }

    push(value){
        this._elements.push(value)
    }

    pushList(values){
        this._elements.push(...values)
    }

    peek(){
        if (this._elements.length == 0){
            return null;
        }
        return this._elements.slice(-1)[0]
    }

    get length() {
        return this._elements.length
    }

    clear(){
        this._elements = []
    }

    get elements(){
        return this._elements;
    }

    print(){
        console.log(`[${this._elements.map(n => n.id).join(", ")}]`)
    }


}



module.exports = Stack;