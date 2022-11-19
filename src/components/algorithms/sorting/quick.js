const delayPerUpdate = 7;

function displayChanges (leftPos, rightPos, curHeight, nextHeight) {
    document.getElementById("Bars" + leftPos.toString()).style.height = nextHeight.toString() + "px";
    document.getElementById("Bars" + rightPos.toString()).style.height = curHeight.toString() + "px";      
}

function modifyHeightRef (heightRef, leftPos, rightPos, curHeight, nextHeight) {
    heightRef[leftPos] = nextHeight;
    heightRef[rightPos] = curHeight;
}

function splitSort(startPos, endPos, heightRef, delayTime){
    let rightPos = endPos + 1, leftPos = startPos - 1, timeoutId = 0;
    while (leftPos < rightPos){
        for (leftPos++; heightRef[leftPos++] < heightRef[endPos];);
        for (rightPos--; heightRef[rightPos--] > heightRef[endPos];);
        if(--leftPos < ++rightPos){
            timeoutId = setTimeout(displayChanges, delayTime +=delayPerUpdate, leftPos, rightPos, heightRef[leftPos], heightRef[rightPos]); 
            modifyHeightRef(heightRef, leftPos, rightPos, heightRef[leftPos], heightRef[rightPos]);
        }
    }
    timeoutId = setTimeout(displayChanges, delayTime += delayPerUpdate, leftPos, endPos, heightRef[leftPos], heightRef[endPos]);
    modifyHeightRef(heightRef, leftPos, endPos, heightRef[leftPos], heightRef[endPos]);
    if(endPos - startPos > 1){
        [timeoutId, delayTime] = splitSort(startPos, leftPos - 1, heightRef, delayTime);
        [timeoutId, delayTime] = splitSort(leftPos, endPos, heightRef, delayTime);
    }
    return([timeoutId, delayTime]);
}

export default function QuickSort (heightRef, maxBars){
    return(splitSort(0, maxBars - 1, heightRef, 4)[0]);
}
