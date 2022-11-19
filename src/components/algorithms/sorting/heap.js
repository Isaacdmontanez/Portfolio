const delayPerUpdate = 5;

function displayChanges (curPos, secondPos, curHeight, secondHeight) {
    document.getElementById("Bars" + curPos.toString()).style.height = secondHeight.toString() + "px";
    document.getElementById("Bars" + secondPos.toString()).style.height = curHeight.toString() + "px";
}

function modifyHeightRef (heightRef, curPos, secondPos, curHeight, secondHeight) {
    heightRef[curPos] = secondHeight;
    heightRef[secondPos] = curHeight;
}

function adjustHeap(heightRef, maxBars, startPos, delayTime){
    let largestPos = startPos;
    let leftPos = startPos * 2 + 1;
    let rightPos = startPos * 2 + 2;
    if(leftPos < maxBars && heightRef[leftPos] > heightRef[largestPos]){
        largestPos = leftPos;
    }
    if(rightPos < maxBars && heightRef[rightPos] > heightRef[largestPos]){
        largestPos = rightPos;
    }
    if(largestPos !== startPos){
        setTimeout (displayChanges, delayTime += delayPerUpdate, largestPos, startPos, heightRef[largestPos], heightRef[startPos]);
        modifyHeightRef(heightRef, largestPos, startPos, heightRef[largestPos], heightRef[startPos]);
        delayTime = adjustHeap(heightRef, maxBars, largestPos, delayTime);
    }
    return(delayTime);
}

function sortHeap (heightRef, maxBars, delayTime){
    let timeoutId = 0;
    for(let curSize = 0, curPos = maxBars - 1; curPos > 0; curPos--, curSize++){
        timeoutId = setTimeout (displayChanges, delayTime += delayPerUpdate, curPos, 0, heightRef[curPos], heightRef[0]);
        modifyHeightRef(heightRef, curPos, 0, heightRef[curPos], heightRef[0]);
        delayTime = adjustHeap(heightRef, curPos, 0, delayTime);
    }
    return(timeoutId);
}

function buildMaxHeap (heightRef, maxBars, delayTime){
    for (let curPos = Math.floor(maxBars/2) - 1; curPos >= 0; curPos--){
        delayTime = adjustHeap(heightRef, maxBars, curPos, delayTime);
    }
    return(delayTime);
}

export default function HeapSort (heightRef, maxBars){
    let delayTime = 4, timeoutId = 0;
    delayTime = buildMaxHeap(heightRef, maxBars, delayTime);
    timeoutId = sortHeap(heightRef, maxBars, delayTime);
    return(timeoutId);
}