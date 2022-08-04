const PathTopology = require("./PathTopology");

let  v;
let adjList;
let pathTopology;
let pathsArray = [];
const Graph = (vertices) => {
    v = vertices;
    initAdjList();
}

const initAdjList = () => {
    adjList = new Array(v);

    for (let i = 0; i < v; i++) {
        adjList[i] = [];
    }
}

const addEdge = (u,v) => {
    adjList[u].push(v);
}

const getAllPaths = (s,d) => {
    let isVisited = new Array(v);
    pathTopology = new PathTopology(s,d,[]);
    for(let i=0;i<v;i++)
        isVisited[i]=false;
    let pathList = [];

    pathList.push(s);

    return getAllPathsUtil(s, d, isVisited, pathList);
}


const getAllPathsUtil = (u,d,isVisited,localPathList) => {
    if (u == (d)) {
        let foundPath = localPathList.slice();
        pathTopology.addPath(foundPath);
        return;
        // pathTopology = pathTopology._paths.concat(localPathList);
        // return pathTopology;
    }

    isVisited[u] = true;

    for (let i=0;i< adjList[u].length;i++) {
        if (!isVisited[adjList[u][i]]) {

            localPathList.push(adjList[u][i]);
            getAllPathsUtil(adjList[u][i], d,
                isVisited, localPathList);

            localPathList.splice(localPathList.indexOf
            (adjList[u][i]),1);
        }
    }
    isVisited[u] = false;
}


const getCFGPaths = (cfg) =>{
    Graph(cfg._nodes.length);
    let graphEdges = cfg.getAllEdges();
    graphEdges.forEach(edge => {
        if(edge._target){
            addEdge(edge._source, edge._target);
        }
    })

    let nodePairsPaths = [];
    graphEdges.forEach(edge => {
        if(edge._target){
            getAllPaths(edge._source, edge._target);
            pathsArray.push(pathTopology)
        }
    })

    return pathsArray;

}
module.exports = {
    Graph,
    addEdge,
    getAllPaths,
    getCFGPaths
}