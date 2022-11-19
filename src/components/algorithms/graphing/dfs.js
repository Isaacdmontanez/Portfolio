function HighlightQueue(xStack, yStack, stackCount){
    while(stackCount-- > 0){
        let curStackName = document.getElementById(xStack[stackCount].toString() + " " + yStack[stackCount].toString()).name;
        if (curStackName !== "wallCube" && curStackName !== "startCube" && curStackName !== "endCube"){
            document.getElementById(xStack[stackCount].toString() + " " + yStack[stackCount].toString()).name += "-queue"
        }
    }
}

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

export default function BFS(xStart, yStart, endPos, gridData, xSize, ySize){
    let xStack = new Array(xStart), yStack = new Array(yStart);
    gridData[parseInt(xStack) + parseInt(yStack) * xSize].isVisited = 1;
    for (let isStartNode = 1, stackCount = 0; stackCount >= 0; stackCount--, isStartNode = 0){
        let curXPos = parseInt(xStack[stackCount]), curYPos = parseInt(yStack[stackCount]);
        if(!isStartNode){
            document.getElementById(curXPos.toString() + " " + curYPos.toString()).name = document.getElementById(curXPos.toString() + " " + curYPos.toString()).name.split("-")[0] + "-visited";
        }
        for(let checkXPos = curXPos, checkYPos = curYPos, checkEachNeighbor = 0; checkEachNeighbor < 4; checkEachNeighbor++, checkXPos = curXPos, checkYPos = curYPos){
            switch(checkEachNeighbor){
                default:
                case 0:
                    checkXPos--;
                    break;
                case 1:
                    checkYPos++;
                    break;
                case 2:
                    checkXPos++;
                    break;
                case 3: 
                    checkYPos--;
                    break;
            }
            if (checkYPos < 0 || checkXPos < 0 || checkYPos >= ySize || checkXPos >= xSize) {
                continue;
            }
            let checkGridPos = checkXPos + checkYPos * xSize;
            let checkNeighborName = document.getElementById(checkXPos.toString() + " " + checkYPos.toString()).name;
            if(!gridData[checkGridPos].isVisited && (checkNeighborName !== "wallCube" && checkNeighborName !== "startCube")){
                gridData[checkGridPos].isVisited = 1;
                gridData[checkGridPos].previousXNode = curXPos;
                gridData[checkGridPos].previousYNode = curYPos;
                xStack[stackCount] = checkXPos;
                yStack[stackCount] = checkYPos;
                if(checkXPos === parseInt(endPos[0]) && checkYPos === parseInt(endPos[1])){
                    HighlightPath(checkXPos, checkYPos, xStart, yStart, gridData, xSize);
                    HighlightQueue(xStack, yStack, stackCount);
                    return;
                }
                stackCount++;
            }
        }
    }
}