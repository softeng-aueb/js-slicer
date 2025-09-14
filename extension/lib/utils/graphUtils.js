const PathTopology = require("./PathTopology");
const _ = require("lodash")

class Graph {
    constructor(vertices) {
        this._v = vertices;
        this._adjList = this.initAdjList();
        this._pathTopology;
        this._pathsArray = [];
    }

    initAdjList = () => {
        let adjList = new Array(this._v);

        for (let i = 0; i < this._v; i++) {
            adjList[i] = [];
        }
        return adjList;
    }

    addEdge = (u,v) => {
        this._adjList[u].push(v);
    }

    getAllPaths = (s,d) => {
        let isVisited = new Array(this._v);
        this._pathTopology = new PathTopology(s,d,[]);
        for(let i=0;i<this._v;i++)
            isVisited[i]=false;
        let pathList = [];

        pathList.push(s);

        return this.getAllPathsUtil(s, d, isVisited, pathList);
    }

    getAllPathsUtil = (u,d,isVisited,localPathList) => {
        if (u == (d)) {
            let foundPath = localPathList.slice();
            this._pathTopology.addPath(foundPath);
            return;
        }

        isVisited[u] = true;

        for (let i=0;i< this._adjList[u].length;i++) {
            if (!isVisited[ this._adjList[u][i]]) {

                localPathList.push( this._adjList[u][i]);
                this.getAllPathsUtil( this._adjList[u][i], d,
                    isVisited, localPathList);

                localPathList.splice(localPathList.indexOf
                ( this._adjList[u][i]),1);
            }
        }
        isVisited[u] = false;
    }

    getCFGPaths = (cfg) =>{

        let graphEdges = cfg.getAllEdges();
        graphEdges.forEach(edge => {
            if(edge._target){
                this.addEdge(edge._source, edge._target);
            }
        })

        cfg._nodes.forEach(node1 => {
            cfg._nodes.filter(node2 => !_.isEqual(node1,node2)).forEach(node2 => {
                this.getAllPaths(node1._id, node2._id);
                let pathTopology  = this._pathTopology;
                if(pathTopology && pathTopology._paths && pathTopology._paths.length){
                    this._pathsArray.push(this._pathTopology)
                }
            })
        })
        return this._pathsArray;

    }
}

module.exports = Graph