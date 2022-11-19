function HighlightPath (curXPos, curYPos, startXPos, startYPos, gridData, xSize){
    if(gridData[parseInt(curXPos) + parseInt(curYPos) * xSize].weight === 999999){
        return;
    }
    for (let isEnd = 1; parseInt(curXPos) !== parseInt(startXPos) || parseInt(curYPos) !== parseInt(startYPos); isEnd = 0){
        if(!isEnd){
            document.getElementById(curXPos.toString() + " " + curYPos.toString()).name = document.getElementById(curXPos.toString() + " " + curYPos.toString()).name.split("-")[0] + "-path";
        }
        let tempX = gridData[parseInt(curXPos) + parseInt(curYPos) * xSize].previousXNode;
        curYPos = gridData[parseInt(curXPos) + parseInt(curYPos) * xSize].previousYNode;
        curXPos = tempX;
    }
}

function GetCubeVals(xSize, ySize){
    let cubeVals = [];
    for(let i = 0; i < xSize * ySize; i++){
        let namePos = (i%xSize).toString() + " " + (Math.floor(i/xSize)).toString();
        if(document.getElementById(namePos).name.includes("heavy")){
            cubeVals[i] = 10;
            continue;
        }
        if(document.getElementById(namePos).name.includes("light")){
            cubeVals[i] = 5;
            continue;
        }
        if(document.getElementById(namePos).name.includes("negative")){
            cubeVals[i] = -5;
            continue;
        }
        cubeVals[i] = 1;
    }
    return(cubeVals);
}

function getNeighbors(loopNum, checkXPos, checkYPos, xSize, ySize){
    checkXPos = parseInt(checkXPos);
    checkYPos = parseInt(checkYPos);
    switch(loopNum){
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
        checkXPos = -1;
    }
    return([checkXPos, checkYPos]);
}

function UpdateCubeVals (gridData, cubeVals, xStart, yStart, xSize, ySize){
    let xStack = new Array([xStart]), yStack = new Array([yStart]);
    for (let curPos = 0; xStack.length > curPos; curPos++){
        for (let checkEachNeighbor = 0; checkEachNeighbor < 4; checkEachNeighbor++){
            let [checkXPos, checkYPos] = getNeighbors(checkEachNeighbor, xStack[curPos], yStack[curPos], xSize, ySize);
            let checkGridPos = checkXPos + checkYPos * xSize, curGridPos = parseInt(xStack[curPos]) + parseInt(yStack[curPos]) * xSize, checkedIdName = checkXPos.toString() + " " + checkYPos.toString();
            if(checkXPos === -1){
                continue;
            }
            gridData[curGridPos].isVisited = 1;
            if(!gridData[checkGridPos].isVisited && gridData[curGridPos].weight + cubeVals[checkGridPos] < gridData[checkGridPos].weight &&
                !document.getElementById(checkedIdName).name.includes("wall")){
                gridData[checkGridPos].weight = gridData[curGridPos].weight + cubeVals[checkGridPos];
                gridData[checkGridPos].previousXNode = xStack[curPos];
                gridData[checkGridPos].previousYNode = yStack[curPos];
                if(!gridData[checkGridPos].isVisited){
                    xStack.push(checkXPos);
                    yStack.push(checkYPos);
                }
            }
        }
    }
    for(let i = 0; i < xSize * ySize; i++){
        gridData[i].isVisited = 0;
    }
    return(gridData);
}

function FindNegativeCycle(gridData, xSize, ySize){
    let isNegativeCycle = 0;
    for(let x = 0; x < xSize; x++){
        for (let y = 0; y < ySize; y++){
            for (let checkEachNeighbor = 0; checkEachNeighbor < 4; checkEachNeighbor++){
                let [checkXPos, checkYPos] = getNeighbors(checkEachNeighbor, x, y, xSize, ySize);
                let checkIdName = checkXPos.toString() + " " + checkYPos.toString(), curIdName = x.toString() + " " + y.toString();
                if(checkXPos === -1 || gridData[x+y*xSize].weight === 999999){
                    continue;
                }
                if(document.getElementById(curIdName).name.includes("negative") && (document.getElementById(checkIdName).name.includes("negative") || 
                document.getElementById(checkIdName).name.includes("default") || document.getElementById(checkIdName).name.includes("end") || document.getElementById(checkIdName).name.includes("kruskal"))){
                    isNegativeCycle = 1;
                    document.getElementById(curIdName).name = document.getElementById(curIdName).name.split("-")[0] + "-cycle";
                }
            }
        }
    }
    return(isNegativeCycle);
}

export default function BellmanFord(xStart, yStart, endPos, gridData, xSize, ySize){
    let cubeVals = GetCubeVals(xSize, ySize);
    xStart = parseInt(xStart);
    yStart = parseInt(yStart);
    gridData[xStart + yStart * xSize].weight = 0;
    gridData = UpdateCubeVals(gridData, cubeVals, xStart, yStart, xSize, ySize);
    for(let x = 0; x < xSize; x++){
        for(let y = 0; y < ySize; y++){
            if((x === xStart && y === yStart) || gridData[x + y * xSize].weight === 999999){
                continue;
            }
            gridData[xStart + yStart * xSize].weight = 0;
            gridData = UpdateCubeVals(gridData, cubeVals, x, y, xSize, ySize);
        }
    }
    let isNegativeCycle = FindNegativeCycle(gridData, xSize, ySize);
    if (!isNegativeCycle){
        HighlightPath(endPos[0], endPos[1], xStart, yStart, gridData, xSize);
    }
    return(isNegativeCycle);
}