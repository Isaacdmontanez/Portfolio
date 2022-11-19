const delayPerUpdate = 30;

function displayChanges (leftPos, rightPos, curHeight, nextHeight) {
    document.getElementById("Bars" + leftPos.toString()).style.height = nextHeight.toString() + "px";
    document.getElementById("Bars" + rightPos.toString()).style.height = curHeight.toString() + "px";      
}

function modifyHeightRef (heightRef, leftPos, rightPos, curHeight, nextHeight) {
    heightRef[leftPos] = nextHeight;
    heightRef[rightPos] = curHeight;
}

export default function SelectionSort (heightRef, maxBars){
    let delayTime = 4, timeoutId = 0;
    for(let curPos = 0; curPos < maxBars; curPos++){
        let curBest = curPos;
        for(let checkPos = curPos; checkPos < maxBars; checkPos++){
            if(heightRef[checkPos] < heightRef[curBest]){
                curBest = checkPos;
            }
        }
        timeoutId = setTimeout(displayChanges, delayTime += delayPerUpdate, curPos, curBest, heightRef[curPos], heightRef[curBest]);
        modifyHeightRef(heightRef, curPos, curBest, heightRef[curPos], heightRef[curBest]);
    }
    return(timeoutId);
}