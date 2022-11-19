function HighlightPath (curXPos, curYPos, startXPos, startYPos, gridData, xSize){
    for (let isEnd = 1; curXPos !== parseInt(startXPos) || curYPos !== parseInt(startYPos); isEnd = 0){
        if(!isEnd){
            document.getElementById(curXPos.toString() + " " + curYPos.toString()).name = document.getElementById(curXPos.toString() + " " + curYPos.toString()).name.split("-")[0] + "-path";
        }
        let tempX = gridData[curXPos + curYPos * xSize].previousXNode;
        curYPos = gridData[curXPos + curYPos * xSize].previousYNode;
        curXPos = tempX;
    }
}

function GetSmallestestWeightPos (xStack, yStack, gridData, xSize){
    let numOfElements = xStack.length, minWeight = 999999, minWeightPos = -1;
    for (let curElement = 0; curElement < numOfElements; curElement++){
        if(gridData[parseInt(xStack[curElement]) + parseInt(yStack[curElement]) * xSize].weight < minWeight){
            minWeight = gridData[parseInt(xStack[curElement]) + parseInt(yStack[curElement]) * xSize].weight;
            minWeightPos = curElement;
        }
    }
    return(minWeightPos);
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

export default function Dijkstra(xStart, yStart, endPos, gridData, xSize, ySize){
    let xStack = new Array(xStart), yStack = new Array(yStart);
    gridData[parseInt(xStack[0]) + parseInt(yStack[0]) * xSize].weight = 0;
    for(let isFirstLoop = 1; xStack.length; isFirstLoop = 0){
        let minWeightPos = GetSmallestestWeightPos (xStack, yStack, gridData, xSize);
        let curXPos = parseInt(xStack[minWeightPos]), curYPos = parseInt(yStack[minWeightPos]);
        xStack.splice(minWeightPos, 1);
        yStack.splice(minWeightPos, 1);
        if(curXPos === parseInt(endPos[0]) && curYPos === parseInt(endPos[1])){
            HighlightPath(curXPos, curYPos, xStart, yStart, gridData, xSize);
            return;
        }
        if(!isFirstLoop){
            document.getElementById(curXPos.toString() + " " + curYPos.toString()).name = document.getElementById(curXPos.toString() + " " + curYPos.toString()).name.split("-")[0] + "-visited";
        }
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
            if(gridData[curGridPos].weight + GetCubeVal(namePos) < gridData[checkGridPos].weight && document.getElementById(namePos).name !== "wallCube"){
                xStack.push(checkXPos);
                yStack.push(checkYPos);
                gridData[checkGridPos].previousXNode = curXPos;
                gridData[checkGridPos].previousYNode = curYPos;
                gridData[checkGridPos].weight = gridData[curGridPos].weight + GetCubeVal(namePos);
            }
        }
    }
}