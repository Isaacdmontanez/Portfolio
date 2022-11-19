function displayChanges (curPos, curHeight, nextHeight) {
    document.getElementById("Bars" + curPos.toString()).style.height = nextHeight.toString() + "px";
    document.getElementById("Bars" + (curPos + 1).toString()).style.height = curHeight.toString() + "px";
}

function modifyHeightRef (heightRef, curPos, curHeight, nextHeight) {
    heightRef[curPos] = nextHeight;
    heightRef[curPos + 1] = curHeight;
}

export default function BubbleSort (heightRef, maxBars){
    let timeoutId = 0;
    for(let delayTime = 4, isChanged = 1; isChanged;){
        isChanged = 0;
        for(let curPos = 0; curPos < maxBars - 1; curPos++){
            if(heightRef[curPos] > heightRef[curPos + 1]){
                isChanged = 1;
                timeoutId = setTimeout(displayChanges, delayTime++, curPos, heightRef[curPos], heightRef[curPos + 1]);
                modifyHeightRef(heightRef, curPos, heightRef[curPos], heightRef[curPos + 1]);
            }
        }
    }
    return(timeoutId);
}