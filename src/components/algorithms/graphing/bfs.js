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
    for (let curCount = 0, stackCount = 1; stackCount !== curCount; curCount++){
        let curXPos = parseInt(xStack[curCount]), curYPos = parseInt(yStack[curCount]);
        if(curXPos === parseInt(endPos[0]) && curYPos === parseInt(endPos[1])){
            HighlightPath(curXPos, curYPos, xStack[0], yStack[0], gridData, xSize);
            return;
        }
        if(curCount){
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
            let checkGridPos = checkXPos + checkYPos * xSize;
            let checkNeighborName = document.getElementById(checkXPos.toString() + " " + checkYPos.toString()).name;
            if(!gridData[checkGridPos].isVisited && (checkNeighborName !== "wallCube" && checkNeighborName !== "startCube")){
                gridData[checkGridPos].isVisited = 1;
                gridData[checkGridPos].previousXNode = curXPos;
                gridData[checkGridPos].previousYNode = curYPos;
                xStack[stackCount] = checkXPos;
                yStack[stackCount] = checkYPos;
                stackCount++;
            }
        }
    }
}