function HighlightPath (curXPos, curYPos, startXPos, startYPos, dijkstraGridData, xSize){
    for (let isEnd = 1; curXPos !== startXPos || curYPos !== startYPos; isEnd = 0){
        if(!isEnd && !document.getElementById(curXPos.toString() + " " + curYPos.toString()).name.includes("kruskal")  
        && !document.getElementById(curXPos.toString() + " " + curYPos.toString()).name.includes("-double")){
            if(document.getElementById(curXPos.toString() + " " + curYPos.toString()).name.includes("-path")){
                document.getElementById(curXPos.toString() + " " + curYPos.toString()).name = document.getElementById(curXPos.toString() + " " + curYPos.toString()).name.split("-")[0] + "-double";
            } else {
                document.getElementById(curXPos.toString() + " " + curYPos.toString()).name = document.getElementById(curXPos.toString() + " " + curYPos.toString()).name.split("-")[0] + "-path";
            }
        }
        let tempX = dijkstraGridData[curXPos + curYPos * xSize].previousXNode;
        curYPos = dijkstraGridData[curXPos + curYPos * xSize].previousYNode;
        curXPos = tempX;
    }
}

function GetSmallestestWeightPos (xStack, yStack, dijkstraGridData, xSize){
    let numOfElements = xStack.length, minWeight = 999999, minWeightPos = -1;
    for (let i = 0; i < numOfElements; i++){
        if(dijkstraGridData[parseInt(xStack[i]) + parseInt(yStack[i]) * xSize].weight < minWeight){
            minWeight = dijkstraGridData[parseInt(xStack[i]) + parseInt(yStack[i]) * xSize].weight;
            minWeightPos = i;
        }
    }
    let curXPos = parseInt(xStack[minWeightPos]), curYPos = parseInt(yStack[minWeightPos]);
    xStack.splice(minWeightPos, 1);
    yStack.splice(minWeightPos, 1);
    return([curXPos, curYPos]);
}

function GetCubeVal(namePos){
    if(document.getElementById(namePos).name.includes("heavy")){
        return(10);
    }
    if (document.getElementById(namePos).name.includes("light")){
        return(5);
    }
    if (document.getElementById(namePos).name.includes("negative")){
        return(0);
    }
    return(1);
}

function ModifiedDijkstra (xStart, yStart, dijkstraGridData, xSize, ySize){
    let xStack = new Array([xStart]), yStack = new Array([yStart]);
    dijkstraGridData[parseInt(xStack[0]) + parseInt(yStack[0]) * xSize].weight = 0;
    while(xStack.length){
        let [curXPos, curYPos] = GetSmallestestWeightPos (xStack, yStack, dijkstraGridData, xSize);
        for(let checkXPos = curXPos, checkYPos = curYPos, checkEachNeighbor = 0; checkEachNeighbor < 4; checkEachNeighbor++, checkXPos = curXPos, checkYPos = curYPos){
            switch(checkEachNeighbor){
                default:
                case 0:
                    checkYPos--;
                    break;
                case 1:
                    checkXPos++;
                    break;
                case 2:
                    checkYPos++;
                    break;
                case 3: 
                    checkXPos--;
                    break;
            }
            if (checkYPos < 0 || checkXPos < 0 || checkYPos >= ySize || checkXPos >= xSize) {
                continue;
            }
            let namePos = checkXPos.toString() + " " + checkYPos.toString(), checkGridPos = checkXPos + checkYPos * xSize, curGridPos = curXPos + curYPos * xSize;
            if(dijkstraGridData[curGridPos].weight + GetCubeVal(namePos) < dijkstraGridData[checkGridPos].weight && document.getElementById(namePos).name !== "wallCube"){
                xStack.push(checkXPos);
                yStack.push(checkYPos);
                dijkstraGridData[checkGridPos].previousXNode = curXPos;
                dijkstraGridData[checkGridPos].previousYNode = curYPos;
                dijkstraGridData[checkGridPos].weight = dijkstraGridData[curGridPos].weight + GetCubeVal(namePos);
            }
        }
    }
}

function NumSort(a, b){
    return(a.weight - b.weight);
}

function BuildKruskalEdges(gridData, dijkstraGridData, distances, routerPos, kruskalPos, xSize, ySize){
    for(let startNode = 0; startNode < kruskalPos[0].length; startNode++){
        routerPos[startNode] = startNode;
        dijkstraGridData[startNode] = structuredClone(gridData);
        ModifiedDijkstra (kruskalPos[0][startNode], kruskalPos[1][startNode], dijkstraGridData[startNode], xSize, ySize);
        for (let endNode = 0; endNode < kruskalPos[0].length; endNode++){
            if(endNode === startNode){
                continue;
            }
            distances.push({
                weight: dijkstraGridData[startNode][kruskalPos[0][endNode] + kruskalPos[1][endNode] * xSize].weight,
                start: startNode,
                end: endNode
            });
        }
    }
    distances.sort(NumSort);
}

function findKruskalNodes(xSize, ySize){
    let kruskalXPos = [], kruskalYPos = [];
    for(let x = 0; x < xSize; x++){
        for(let y = 0; y < ySize; y++){
            if(document.getElementById(x.toString() + " " + y.toString()).name.includes("kruskal")){
                kruskalXPos.push(x);
                kruskalYPos.push(y);
            }
        }
    }
    return([kruskalXPos, kruskalYPos]);
}

function GetParentNode (checkRoute, routerPos){
    let iterations = 0;
    while(checkRoute !== routerPos[checkRoute]){
        routerPos[checkRoute] = routerPos[routerPos[checkRoute]];
        checkRoute = routerPos[checkRoute];
    }
    return([checkRoute, iterations]);
}

function UpdateRouter(dijkstraGridData, routerPos, kruskalPos, distances, xSize){
    for(let curDijkstraCount = 0; curDijkstraCount < distances.length; curDijkstraCount++){
        let checkStart = GetParentNode(distances[curDijkstraCount].start, routerPos);
        let checkEnd = GetParentNode(distances[curDijkstraCount].end, routerPos);
        if(checkStart[0] !== checkEnd[0] && distances[curDijkstraCount].weight < 999999){
            if(checkStart[1] > checkEnd[1]){
                routerPos[checkEnd[0]] = checkStart[0];
            } else {
                routerPos[checkStart[0]] = checkEnd[0];
            }
            HighlightPath(kruskalPos[0][distances[curDijkstraCount].end], kruskalPos[1][distances[curDijkstraCount].end], 
                kruskalPos[0][distances[curDijkstraCount].start], kruskalPos[1][distances[curDijkstraCount].start], dijkstraGridData[distances[curDijkstraCount].start], xSize);
            return;
        }
    }
    return;
}

export default function Kruskal(gridData, xSize, ySize){
    let kruskalPos = findKruskalNodes(xSize, ySize), dijkstraGridData = [], distances = [], routerPos = [];
    BuildKruskalEdges(gridData, dijkstraGridData, distances, routerPos, kruskalPos, xSize, ySize);
    for(let i = 1; i < kruskalPos[0].length; i++){
        UpdateRouter(dijkstraGridData, routerPos, kruskalPos, distances, xSize);
    }
}