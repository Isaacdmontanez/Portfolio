/* eslint-disable no-array-constructor */
/* eslint-disable no-useless-computed-key */
import '../css/graphing.css';
import BFS from '../algorithms/graphing/bfs.js';
import DFS from '../algorithms/graphing/dfs.js';
import Dijkstra from '../algorithms/graphing/dijkstra.js';
import BellmanFord from './../algorithms/graphing/bellman-ford.js';
import Kruskal from './../algorithms/graphing/kruskal.js';

function updateErrorModals(errorNum){
    switch(errorNum){
        case 0:
            document.getElementById("graphingErrorText").innerText = "";
            break;
        case 1:
            document.getElementById("graphingErrorText").innerText = "Please place a Start Node";
            break;
        case 2:
            document.getElementById("graphingErrorText").innerText = "Please place an End Node";
            break;
        case 3:
            document.getElementById("graphingErrorText").innerText = "Please place a Start and End Node";
            break;
        case 4:
            document.getElementById("graphingErrorText").innerText = "Please place at least two Kruskal Nodes";
            break;
        case 5:
            document.getElementById("graphingErrorText").innerText = "The highlighted Negative Weights are the detected negative weight cycles";
            break;
        default:
    }
}

function errorModals(){
    return(
        <div id = "graphingErrorModal">
            <p id = "graphingErrorText"/>
        </div>
    )
}

function ClearVisited(generalData){
    for (let x = 0; x < generalData["xSize"]; x++){
        for(let y = 0; y < generalData["ySize"]; y++){
        document.getElementById(x.toString() + " " + y.toString()).name = document.getElementById(x.toString() + " " + y.toString()).name.split("-")[0];
        }
    }
}

function countKruskal(generalData){
    let numOfKruskal = 0;
    for (let x = 0; x < generalData["xSize"]; x++){
        for(let y = 0; y < generalData["ySize"]; y++){
            if(document.getElementById(x.toString() + " " + y.toString()).name.includes("kruskal")){
                numOfKruskal++;
            }
        }
    }
    return(numOfKruskal);
}

function ConfirmUserSettings(generalData){
    if (!generalData["selectedAlgo"]){
        return(1);
    }
    let isStartPosTileStartNode = document.getElementById(generalData["startPos"][0] + " " + generalData["startPos"][1]).name.includes("start");
    let isEndPosTileEndNode = document.getElementById(generalData["endPos"][0]+ " " + generalData["endPos"][1]).name.includes("end");
    if(!isStartPosTileStartNode && !isEndPosTileEndNode && generalData["selectedAlgo"] !== 5){
        generalData["selectedAlgo"] = 0;
        ClearVisited(generalData);
        updateErrorModals(3);
        return(1);
    }
    if(!isStartPosTileStartNode && generalData["selectedAlgo"] !== 5){
        generalData["selectedAlgo"] = 0;
        ClearVisited(generalData);
        updateErrorModals(1);
        return(1);
    }
    if(!isEndPosTileEndNode && generalData["selectedAlgo"] !== 5){
        generalData["selectedAlgo"] = 0;
        ClearVisited(generalData);
        updateErrorModals(2);
        return(1);
    }
    let numOfKruskal = countKruskal(generalData);
    if(generalData["selectedAlgo"] === 5 && numOfKruskal < 2){
        generalData["selectedAlgo"] = 0;
        ClearVisited(generalData);
        updateErrorModals(4);
        return(1);
    }
    updateErrorModals(0);
    return(0);
}

function CreateGridData(generalData){
    generalData["gridData"] = [];
    for(let curPos = 0; curPos < generalData["xSize"] * generalData["ySize"]; curPos++){
        generalData["gridData"][curPos] = {
            weight: 999999,
            isVisited: 0,
            previousXNode: -1,
            previousYNode: -1
        };
    }
}

function launchAlgo (generalData){
    if(ConfirmUserSettings(generalData)){
        return;
    }
    ClearVisited(generalData);
    switch (generalData["selectedAlgo"]){
        case 1:
            BFS(generalData["startPos"][0], generalData["startPos"][1], generalData["endPos"], generalData["gridData"], generalData["xSize"], generalData["ySize"]);
            break;
        case 2: 
            DFS(generalData["startPos"][0], generalData["startPos"][1], generalData["endPos"], generalData["gridData"], generalData["xSize"], generalData["ySize"]);
            break;
        case 3:
            Dijkstra(generalData["startPos"][0], generalData["startPos"][1], generalData["endPos"], generalData["gridData"], generalData["xSize"], generalData["ySize"]);
            break;
        case 4: 
            if(BellmanFord(generalData["startPos"][0], generalData["startPos"][1], generalData["endPos"], generalData["gridData"], generalData["xSize"], generalData["ySize"])){
                updateErrorModals(5);
            }
            break;
        case 5: 
            Kruskal(generalData["gridData"], generalData["xSize"], generalData["ySize"]);
            break;
        default:
    }
    CreateGridData(generalData);
}

function onClickCube (event, generalData) {
    let wasVisited = 0, cordinates = event.target.id.split(" ");
    if(event.target.name.includes('-pathCube')){
       wasVisited = 1;
    }
    if(event.target.name.includes('-visitedCube')){
       wasVisited = 2;
    }
    if(((event.target.name.includes('startCube') && !document.getElementById("startGraphRadio").checked) || (event.target.name.includes('endCube') && !document.getElementById("endGraphRadio").checked)) && generalData["selectedAlgo"] !== 5){
        ClearVisited(generalData);
        wasVisited = 0;
        generalData["selectedAlgo"] = 0;
    }
    if(event.target.name.includes("kruskal") && !document.getElementById("kruskalRadio").checked && generalData["selectedAlgo"] === 5 && countKruskal(generalData) < 2){
        ClearVisited(generalData);
        wasVisited = 0;
        generalData["selectedAlgo"] = 0;
    }
    if(document.getElementById("removeGraphRadio").checked){
        event.target.name = "defaultCube";
    } else if (document.getElementById("startGraphRadio").checked){
        if(generalData["lastStart"] && generalData["lastStart"].target.name === "startCube"){
            generalData["lastStart"].target.name = "defaultCube";
        }
        generalData["lastStart"] = event;
        event.target.name = "startCube";
        generalData["startPos"] = cordinates;
        wasVisited = 0;
    } else if (document.getElementById("endGraphRadio").checked){
        if(generalData["lastEnd"] && generalData["lastEnd"].target.name === "endCube"){
            generalData["lastEnd"].target.name = "defaultCube";
        }
        generalData["lastEnd"] = event;
        event.target.name = "endCube";
        generalData["endPos"] = cordinates;
        wasVisited = 0;
    } else if (document.getElementById("wallGraphRadio").checked){
        event.target.name = "wallCube";
    }  else if (document.getElementById("negativeWeightGraphRadio").checked){
        event.target.name = "negativeWeightCube";
    } else if (document.getElementById("lightWeightGraphRadio").checked){
        event.target.name = "lightWeightCube";
    } else if (document.getElementById("heavyWeightGraphRadio").checked){
        event.target.name = "heavyWeightCube";
    } else if (document.getElementById("kruskalRadio").checked){
        event.target.name = "kruskalCube";
    }
    if(wasVisited === 1){
        event.target.name += '-pathCube';
    }
    if(wasVisited === 2){
        event.target.name += '-visitedCube';
    }
    if(generalData["selectedAlgo"]){
        launchAlgo(generalData);
    }
}

function StopCubeDrag(generalData){
    generalData["newDragName"] = "defaultCube";
    for(let x = 0; x < generalData["xSize"]; x++){
        for (let y = 0; y < generalData["ySize"]; y++){
            if((document.getElementById(x.toString() + " " + y.toString()).name.includes("startCube") && (x !== parseInt(generalData["startPos"][0]) || y !== parseInt(generalData["startPos"][1]))) || 
                (document.getElementById(x.toString() + " " + y.toString()).name.includes("endCube") && (x !== parseInt(generalData["endPos"][0]) || y !== parseInt(generalData["endPos"][1])))){
                document.getElementById(x.toString() + " " + y.toString()).name = "defaultCube";
            }
        }
    }
}

function CubeMouseHeld (event, generalData){
    if(generalData["newDragName"].includes("defaultCube")){
        return;
    }
    if(generalData["newDragName"].includes("startCube")){
        generalData["startPos"] = event.target.id.split(" ");
        generalData["lastStart"] = event;
    } else if (generalData["newDragName"].includes("endCube")){
        generalData["endPos"] = event.target.id.split(" ");
        generalData["lastEnd"] = event;
    }
    document.getElementById(generalData["oldDragPos"]).name = generalData["oldDragName"];
    generalData["oldDragPos"] = event.target.id;
    generalData["oldDragName"] = event.target.name.split("-")[0];
    event.target.name = generalData["newDragName"];
    if(generalData["selectedAlgo"]){
        launchAlgo(generalData);
    }
}

function CubeMouseDown (event, generalData){
    generalData["oldDragName"] = "defaultCube";
    generalData["oldDragPos"] = event.target.id;
    generalData["newDragName"] = event.target.name.split("-")[0];
}

function createDisplayGrid (generalData){
    generalData["displayGrid"] = [];
    for (let y = 0; y < generalData["ySize"]; y++){
        for (let x = 0; x < generalData["xSize"]; x++){
            generalData["displayGrid"].push(<button type = "button" className = "cube" id =  {x + " " + y} name =  "defaultCube" 
            onClick = {(event) => {onClickCube(event, generalData)}} onMouseDown = {(event) => {CubeMouseDown(event, generalData)}} onMouseOver = {(event) => {CubeMouseHeld(event, generalData)}}/>);
        }
    }
}

function ClearGrid(generalData){
    for (let x = 0; x < generalData["xSize"]; x++){
        for(let y = 0; y < generalData["ySize"]; y++){
        document.getElementById(x.toString() + " " + y.toString()).name = "defaultCube";
        }
    }
    updateErrorModals(0);
}

function buildGraphRadio (){
    return(
    <div id = "graphRadioButtons">
        <label className = "labelGraphRadio">REMOVE</label>
        <input type = "radio" className = "graphRadioInput" name = "buildGraphRadio" id = "removeGraphRadio"/>
        <label className = "labelGraphRadio">START</label>
        <input type = "radio" className = "graphRadioInput" name = "buildGraphRadio" id = "startGraphRadio"/>
        <label className = "labelGraphRadio">END</label>
        <input type = "radio" className = "graphRadioInput" name = "buildGraphRadio" id = "endGraphRadio"/>
        <label className = "labelGraphRadio">WALL</label>
        <input type = "radio" className = "graphRadioInput" name = "buildGraphRadio" id = "wallGraphRadio"/>
        <label className = "labelGraphRadio">NEGATIVE WEIGHT</label>
        <input type = "radio" className = "graphRadioInput" name = "buildGraphRadio" id = "negativeWeightGraphRadio"/>
        <label className = "labelGraphRadio">LIGHT WEIGHT</label>
        <input type = "radio" className = "graphRadioInput" name = "buildGraphRadio" id = "lightWeightGraphRadio"/>
        <label className = "labelGraphRadio">HEAVY WEIGHT</label>
        <input type = "radio" className = "graphRadioInput" name = "buildGraphRadio" id = "heavyWeightGraphRadio"/>
        <label className = "labelGraphRadio">KRUSKAL NODE</label>
        <input type = "radio" className = "graphRadioInput" name = "buildGraphRadio" id = "kruskalRadio"/>
    </div>
    );
}

function GraphHelpModal(){
    return(
        <div id = "graphHelpModal-hidden" onClick = {function() {updateGraphHelpModal()}}>
            <div className = "graphModalContent">
                <p className = "boldFontInGraphHelpModal">Instructions:</p>
                <p>1. Place a Start and End Node or 2+ Kruskal Nodes for the Kruskal algorithm</p>
                <p>2. Select the algorithm you want to launch</p>
                <p>3. Drag, add, and remove cubes to view changes in real time</p>
                <p className = "boldFontInGraphHelpModal">Node Weight:</p>
                <p>Default Node <div className = "modalCubeDisplay"/> 1</p>
                <p>Negative Node (Bellman-Ford) <div className = "modalCubeDisplay" id = "modalNegativeCube"/> -5</p>
                <p>Negative Node (Dijkstra & Kruskal) <div className = "modalCubeDisplay" id = "modalNegativeCube"/> 0</p>
                <p>Light Node <div className = "modalCubeDisplay" id = "modalLightCube"/> 5</p>
                <p>Heavy Node <div className = "modalCubeDisplay" id = "modalHeavyCube"/> 10</p>
                <p>All weights are set to 1 on BFS and DFS</p>
            </div>
        </div>
    )
}

function updateGraphHelpModal(){
    if(document.getElementById("graphHelpModal-hidden")){
        document.getElementById("graphHelpModal-hidden").id = "graphHelpModal"
    } else {
        document.getElementById("graphHelpModal").id = "graphHelpModal-hidden"
    }
}

function AlgoBar(generalData) {
    return(
        <div className = "algoBar">
            <ul>
                <li> <input type = "button" value = "   BFS  "         id = "bfsButton"         onClick = {function() {generalData["selectedAlgo"] = 1; launchAlgo(generalData)}}/></li>
                <li> <input type = "button" value = "  DFS  "          id = "dfsButton"         onClick = {function() {generalData["selectedAlgo"] = 2; launchAlgo(generalData)}}/></li>
                <li> <input type = "button" value = " Dijkstra "       id = "dijkstraButton"    onClick = {function() {generalData["selectedAlgo"] = 3; launchAlgo(generalData)}}/></li>
                <li> <input type = "button" value = " Bellman-Ford "   id = "bellmanFordButton" onClick = {function() {generalData["selectedAlgo"] = 4; launchAlgo(generalData)}}/></li>
                <li> <input type = "button" value = " Kruskal  "       id = "kruskalButton"     onClick = {function() {generalData["selectedAlgo"] = 5; launchAlgo(generalData)}}/></li>
                <li> <input type = "button" value = "   |  "           id = "dividerButton"/></li>
                <li> <input type = "button" value = "  Stop  "         id = "stopButton"        onClick = {function() {generalData["selectedAlgo"] = 0; ClearVisited(generalData); updateErrorModals(0)}}/></li>
                <li> <input type = "button" value = "  Clear Grid    " id = "clearButton"       onClick = {function() {generalData["selectedAlgo"] = 0; ClearGrid(generalData)}}/></li>
                <p>  <input type = "button" value = "  Help  "         id = "graphHelpButton"   onClick = {function(){updateErrorModals(0); updateGraphHelpModal()}}/></p>
            </ul>
            {GraphHelpModal()}
            {buildGraphRadio()}
        </div>
    );
}

function getBoardSize(generalData){
    generalData["xSize"] = Math.floor((window.innerWidth) / 30);
    generalData["ySize"] = Math.floor((window.innerHeight * 0.75) / 25);
    generalData["ySize"] = Math.min(generalData["xSize"], generalData["ySize"]);
}

export default function Graphing() {
    let generalData = ({
        ["lastStart"] : 0,
        ["lastEnd"] : 0,
        ["selectedAlgo"] : 0,
        ["xSize"] : 0,
        ["ySize"] : 0,
        ["oldDragName"] : "defaultCube",
        ["newDragName"] : "defaultCube",
        ["startPos"] : new Array (0,0),
        ["endPos"] : new Array (0,0),
        ["displayGrid"] : undefined,
        ["gridData"] : undefined,
        ["oldDragPos"] : undefined,
    });
    getBoardSize(generalData);
    CreateGridData(generalData);
    createDisplayGrid(generalData);
    return(
        <div id = "graphingDiv">
            {AlgoBar(generalData)}
            {errorModals()}
            {<table className = "gridButtons" onMouseLeave = {function () {StopCubeDrag(generalData)}} onMouseUp = {function () {StopCubeDrag(generalData)}}> {generalData["displayGrid"]} </table>}
        </div>
    );
}