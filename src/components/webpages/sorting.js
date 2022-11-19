import '../css/sorting.css';
import BubbleSort from './../algorithms/sorting/bubble.js';
import QuickSort from './../algorithms/sorting/quick.js';
import SelectionSort from '../algorithms/sorting/selection.js';
import HeapSort from '../algorithms/sorting/heap.js';
import InsertionSort from '../algorithms/sorting/insert';

function RandomizeDisplay(){
    let displayLines = [], heightRef = [], maxBars = Math.floor((window.innerWidth - 20)/4);
    for (let curBar = 0; curBar < maxBars; curBar++){
        let tempHeight = Math.floor(Math.random() * (window.innerHeight * 0.85));
        displayLines.push([
            <div 
            id = {"Bars" + curBar.toString()}
            className = "displayLine"
            style = {{height: tempHeight}}
            />
        ]);
        heightRef.push(tempHeight);
    }
    return([displayLines, heightRef, maxBars]);
}

function launchAlgo(selectedAlgo, displayLines, heightRef, maxBars, timeoutId, lastTimeoutId){
    let tempTimeout = timeoutId;
    while(timeoutId-- > lastTimeoutId){
        window.clearTimeout(timeoutId);
    }
    lastTimeoutId = tempTimeout;
    if(maxBars < 0){
        [displayLines, heightRef, maxBars] = RandomizeDisplay();
    }
    for(let curBar = 0; curBar < maxBars; curBar++){
        document.getElementById("Bars" + curBar.toString()).style.height = heightRef[curBar].toString() + "px";
    }
    switch(selectedAlgo){
        case 1:
            timeoutId = BubbleSort(heightRef, maxBars);
            break;
        case 2: 
            timeoutId = InsertionSort(heightRef, maxBars);
            break;
        case 3:
            timeoutId = SelectionSort(heightRef, maxBars);
            break;
        case 4: 
            timeoutId = QuickSort(heightRef, maxBars);
            break;
        case 5: 
            timeoutId = HeapSort(heightRef, maxBars);
            break;
        default:
    }
    return([maxBars * -1, timeoutId, lastTimeoutId]);
}

function algoBar (displayLines, heightRef, maxBars){
    let timeoutId = 0, lastTimeoutId = 0;
    return(
        <div className = "sortAlgoBar">
            <ul>
                <li><input type = "button" value = "   Bubble Sort  " id = "bubbleSortButton"    onClick = {function () {[maxBars, timeoutId, lastTimeoutId] = launchAlgo(1, displayLines, heightRef, maxBars, timeoutId, lastTimeoutId)}}/></li>
                <li><input type = "button" value = " Insertion Sort " id = "insertionSortButton" onClick = {function () {[maxBars, timeoutId, lastTimeoutId] = launchAlgo(2, displayLines, heightRef, maxBars, timeoutId, lastTimeoutId)}}/></li>
                <li><input type = "button" value = " Selection Sort " id = "selectionSortButton" onClick = {function () {[maxBars, timeoutId, lastTimeoutId] = launchAlgo(3, displayLines, heightRef, maxBars, timeoutId, lastTimeoutId)}}/></li>
                <li><input type = "button" value = "  Quick Sort  "   id = "quickSortButton"     onClick = {function () {[maxBars, timeoutId, lastTimeoutId] = launchAlgo(4, displayLines, heightRef, maxBars, timeoutId, lastTimeoutId)}}/></li>
                <li><input type = "button" value = "  Heap Sort  "    id = "heapSortButton"      onClick = {function () {[maxBars, timeoutId, lastTimeoutId] = launchAlgo(5, displayLines, heightRef, maxBars, timeoutId, lastTimeoutId)}}/></li>
            </ul>
        </div>
    )
}

function clearTImeoutOnStart(){
    for(let timeoutId = 1; timeoutId < 1000000; timeoutId++){
        window.clearTimeout(timeoutId);
    }
}

export default function Sorting(){
    clearTImeoutOnStart();
    let [displayLines, heightRef, maxBars] = RandomizeDisplay();
    return(
        <div id = "sortingPageDiv">
            {algoBar(displayLines, heightRef, maxBars)}
            <div className = "barContainer">{displayLines}</div>
        </div>
    );
}