const delayPerUpdate = 1;

function displayChanges (leftPos, rightPos, curHeight, nextHeight) {
    document.getElementById("Bars" + leftPos.toString()).style.height = nextHeight.toString() + "px";
    document.getElementById("Bars" + rightPos.toString()).style.height = curHeight.toString() + "px";      
}

function modifyHeightRef (heightRef, leftPos, rightPos, curHeight, nextHeight) {
    heightRef[leftPos] = nextHeight;
    heightRef[rightPos] = curHeight;
}
export default function InsertionSort (heightRef, maxBars){
    let timeoutId = 0, delayTime = 4;
    for (let curPos = 1; curPos < maxBars; curPos++){
        let curHeight = heightRef[curPos]
        for (let swapPos = curPos - 1; swapPos >= 0 && heightRef[swapPos] > curHeight; swapPos--){
            timeoutId = setTimeout(displayChanges, delayTime += delayPerUpdate, swapPos, swapPos + 1, heightRef[swapPos], heightRef[swapPos + 1]); 
            modifyHeightRef(heightRef, swapPos, swapPos + 1, heightRef[swapPos], heightRef[swapPos + 1]);
        }
    }
    return(timeoutId);
}