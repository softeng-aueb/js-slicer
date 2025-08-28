class PathTopology {
    constructor(source,target,paths) {
        this._source = source;
        this._target = target;
        this._paths = paths;
    }


    get source() {
        return this._source;
    }

    set source(value) {
        this._source = value;
    }

    get target() {
        return this._target;
    }

    set target(value) {
        this._target = value;
    }

    get paths() {
        return this._paths;
    }

    set paths(value) {
        this._paths = value;
    }
    addPath(path){
        this._paths.push(path);
    }
}
module.exports = PathTopology;