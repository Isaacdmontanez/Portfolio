/* eslint-disable eqeqeq */
/* eslint-disable no-useless-computed-key */
/* eslint-disable no-array-constructor */
/* eslint-disable no-loop-func */
/* eslint-disable no-fallthrough */
import "../css/chess.css"
import whitePawn from "../images/whitePawn.png";
import whiteRook from "../images/whiteRook.png";
import whiteKnight from "../images/whiteKnight.png";
import whiteBishop from "../images/whiteBishop.png";
import whiteQueen from "../images/whiteQueen.png";
import whiteKing from "../images/whiteKing.png";
import blackPawn from "../images/blackPawn.png";
import blackRook from "../images/blackRook.png";
import blackKnight from "../images/blackKnight.png";
import blackBishop from "../images/blackBishop.png";
import blackQueen from "../images/blackQueen.png";
import blackKing from "../images/blackKing.png";
import ChessEngine from "../algorithms/chess/chessEngine";
import { generateRandomXorNums, generateBoardHashNum } from "../algorithms/chess/zobristHashing"
import { getOtherPlayerId } from "../algorithms/chess/engineFindMoves";

let mouseMovePieceListener;

//KILLED PIECE DISPLAY---------------------------------------------------------------------------------------------------------------------------------------------------------

function addKilledPieceToDisplay(pieceName, displaySide, killedPieceNum){
    let imageId = "killedPieceOn-" + displaySide + "-" + killedPieceNum;
    let imageOfPiece = '<img src = "' + getImageSource(pieceName) + '" id = "' + imageId + '"/>';
    let topPos, leftPos = 93.7;
    if(displaySide === "Ai"){
        topPos = 11.6 + Math.floor(killedPieceNum /2) * 4;
    } else {
        topPos = 88.4 - Math.floor(killedPieceNum /2) * 4;
    }
    if(killedPieceNum % 2){
        leftPos += 5;
    }
    if(killedPieceNum === 14){
        leftPos += 2.5;
    }
    document.getElementById("ChessKilledPiecesContainer" + displaySide).innerHTML += imageOfPiece;
    document.getElementById(imageId).style.top = topPos + "vh";
    document.getElementById(imageId).style.left = leftPos + "vh";
    document.getElementById(imageId).style.width = "5vh";
    document.getElementById(imageId).style.height = "5vh";
    document.getElementById(imageId).style.position = "fixed";

}

function updateKilledPiece(numOfPieces, playerColor, pieceName, displaySide, killedPieceNum, startingNumOfPieces){
    if(numOfPieces[playerColor + pieceName] === undefined){
        numOfPieces[playerColor + pieceName] = 0;
    }
    for(let numOfAdditionalPieces = 0; numOfPieces[playerColor + pieceName] < startingNumOfPieces - numOfAdditionalPieces; numOfAdditionalPieces++){
        addKilledPieceToDisplay(playerColor + pieceName, displaySide, killedPieceNum++);
    }
    return(killedPieceNum);
}

function clearKilledPieceDisplay(){
    document.getElementById("ChessKilledPiecesContainerUser").innerHTML = "";
    document.getElementById("ChessKilledPiecesContainerAi").innerHTML = "";
}

function killedPieceDisplayHandler(){
    clearKilledPieceDisplay();
    let isAiWhite = 0, numOfPieces = [""];
    for(let y = 0; y < 8; y++){
        for(let x = 0; x < 8; x++){
            let tileName = document.getElementById("tile-" + x + " " + y).name.split("-")[0];
            if(tileName.includes("emptyTile")){
                continue;
            }
            if(numOfPieces[tileName] === undefined){
                numOfPieces[tileName] = 0;
                if(document.getElementById("tile-" + x + " " + y).name.includes("isAi") && tileName.includes("white")){
                    isAiWhite = 1;
                }
            }
            numOfPieces[tileName]++;
        }
    }
    for(let checkBothPlayers = 0; checkBothPlayers < 2; checkBothPlayers++){
        let playerColor, displaySide, killedPieceNum = 0;
        checkBothPlayers ? playerColor = "white" : playerColor = "black";
        (isAiWhite && playerColor === "white") || (!isAiWhite && playerColor === "black") ? displaySide = "Ai" : displaySide = "User";
        killedPieceNum = updateKilledPiece(numOfPieces, playerColor, "Pawn", displaySide, killedPieceNum, 8);
        killedPieceNum = updateKilledPiece(numOfPieces, playerColor, "Knight", displaySide, killedPieceNum, 2);
        killedPieceNum = updateKilledPiece(numOfPieces, playerColor, "Bishop", displaySide, killedPieceNum, 2);
        killedPieceNum = updateKilledPiece(numOfPieces, playerColor, "Rook", displaySide, killedPieceNum, 2);
        killedPieceNum = updateKilledPiece(numOfPieces, playerColor, "Queen", displaySide, killedPieceNum, 1);
    }
}

function displayKilledPieces(){
    return(
    <div id = "chessKilledPiecesDisplay">
        <div id = "ChessKilledPiecesContainerAi"/>
        <div id = "ChessKilledPiecesContainerUser"/>
    </div>
    );
}

//PAST MOVE DASHBOARD---------------------------------------------------------------------------------------------------------------------------------------------------------

function delMoveOnDashBoard(numOfDeletions, boardStates, hashedNumOfBoardRepitions, dashBoardUpdateData){
    let startingSize = boardStates.length;
    dashBoardUpdateData["curMoveNum"] -= numOfDeletions;
    for(let undoLoop = 1; undoLoop <= numOfDeletions && startingSize - undoLoop >= 0; undoLoop++){
        if(!document.getElementById("chessStateButton-" + (startingSize - undoLoop)).innerHTML.includes("0-0")){
            document.getElementById("chessPastMoveImage-" + (startingSize - undoLoop)).parentNode.removeChild(document.getElementById("chessPastMoveImage-" + (startingSize - undoLoop)));
        }
        document.getElementById("chessStateButton-" + (startingSize - undoLoop)).style.display = "none";
        hashedNumOfBoardRepitions.set(boardStates[startingSize - undoLoop][65], Math.max(hashedNumOfBoardRepitions.get(boardStates[startingSize - undoLoop][65]) - 1, 0));
        boardStates.pop();
    }
}

function newGameButton(aiStartPos, dashBoardUpdateData, boardStates, hashedNumOfBoardRepitions, randomXorNums){
    hideEndOfGameModals();
    if(boardStates.length){
        updateBoardState(0, boardStates, -1);
        delMoveOnDashBoard(boardStates.length, boardStates, hashedNumOfBoardRepitions, dashBoardUpdateData);
    }
    for(let y = 0; y < 8; y++){
        for(let x = 0 ; x < 8; x++){
            document.getElementById("tile-" + x + " " + y).name = getTileName(dashBoardUpdateData["isAiWhite"], x, y, dashBoardUpdateData["isAiWhite"], aiStartPos);
        }
    }
    if(dashBoardUpdateData["isAiWhite"]){
        dashBoardUpateForAiStart(dashBoardUpdateData, aiStartPos, boardStates, randomXorNums, 1);
    }
    killedPieceDisplayHandler()
    updatePawnUpgradeButtons(dashBoardUpdateData["isAiWhite"]);
    updateGameStrengthDisplayColor(dashBoardUpdateData);
    return;
}

function undoMove(dashBoardUpdateData, boardStates, hashedNumOfBoardRepitions, randomXorNums, hashedBoardWeights){
    let numOfBoardStates = boardStates.length;
    if(document.getElementById("chessBoardChangeModal-Visible") || !numOfBoardStates){
        return;
    }
    hideEndOfGameModals()
    if(numOfBoardStates < 3){
        updateBoardState(0, boardStates, -1);
        let aiStartPos = Math.random();
        for(let y = 0; y < 8; y++){
            for(let x = 0 ; x < 8; x++){
                document.getElementById("tile-" + x + " " + y).name = getTileName(dashBoardUpdateData["isAiWhite"], x, y, dashBoardUpdateData["isAiWhite"], aiStartPos);
            }
        }
        delMoveOnDashBoard(numOfBoardStates, boardStates, hashedNumOfBoardRepitions, dashBoardUpdateData);
        if(dashBoardUpdateData["isAiWhite"]){
            dashBoardUpateForAiStart(dashBoardUpdateData, aiStartPos, boardStates, randomXorNums, 1);
        }
        return;
    }
    updateBoardState(numOfBoardStates - 3, boardStates, -1);
    delMoveOnDashBoard(2, boardStates, hashedNumOfBoardRepitions, dashBoardUpdateData);
    hashedNumOfBoardRepitions.set(boardStates[boardStates.length - 1][65], Math.max(hashedNumOfBoardRepitions.get(boardStates[boardStates.length - 1][65]) - 1, 0));
    killedPieceDisplayHandler()
    if((numOfBoardStates + dashBoardUpdateData["isAiWhite"]) % 2){
        launchChessEngine(hashedBoardWeights, randomXorNums, hashedNumOfBoardRepitions, dashBoardUpdateData, boardStates);
    }
}

function convertToDashBoardFormat(chessBoardPos, isAiWhite){
    let letterPos = String.fromCharCode("a".charCodeAt(0) + Number(chessBoardPos.split("-")[1].split(" ")[0]));
    let numberPos = Number(chessBoardPos.split(" ")[1]);
    if(isAiWhite){
        numberPos++;
    } else {
        numberPos = 8 - numberPos;
    }
    return(letterPos + numberPos);
}

function getDashBoardImage(dashBoardUpdateData){
    let pieceName = document.getElementById(dashBoardUpdateData["originPos"]).name;
    let newPosPieceName = document.getElementById(dashBoardUpdateData["newPos"]).name;
    if(pieceName === "emptyTile"){
        pieceName = newPosPieceName
    }
    if(pieceName === "emptyTile" || (pieceName.split("-")[1] === newPosPieceName.split("-")[1] && pieceName.includes("canCastle"))){
        return("NA");
    }
    return(getImageSource(pieceName.split("-")[0]));
}

function updatePastMoveDashBoard(dashBoardUpdateData){
    dashBoardUpdateData["curMoveNum"]++;
    let buttonId = "chessStateButton-" + dashBoardUpdateData["curMoveNum"], imageId = 'chessPastMoveImage-' + dashBoardUpdateData['curMoveNum'];
    document.getElementById(buttonId).style.display = "block";
    let imageOfPiece = '<img src = "' + getDashBoardImage(dashBoardUpdateData) + '" id = "' + imageId + '"/>';
    if(dashBoardUpdateData["curMoveNum"] % 2){
        document.getElementById(buttonId).style.backgroundColor = "white";
    } else {
        document.getElementById(buttonId).style.backgroundColor = "whitesmoke";
    }
    if(imageOfPiece.includes('"NA"')){
        if(dashBoardUpdateData["newPos"].split("-")[1].split(" ")[0] === "0"){
            document.getElementById(buttonId).innerText = dashBoardUpdateData["curMoveNum"] + ": 0-0-0";
        } else {
            document.getElementById(buttonId).innerText = dashBoardUpdateData["curMoveNum"] + ": 0-0";
        }
        return;
    }
    let originPos = convertToDashBoardFormat(dashBoardUpdateData["originPos"], dashBoardUpdateData["isAiWhite"]);
    let newPos = convertToDashBoardFormat(dashBoardUpdateData["newPos"], dashBoardUpdateData["isAiWhite"]);
    document.getElementById(buttonId).innerHTML = dashBoardUpdateData["curMoveNum"] + ":" + imageOfPiece + originPos + "-" + newPos;
    document.getElementById(imageId).style.width = "2.3vh";
    document.getElementById(imageId).style.height = "2.3vh";
}

function dashBoardUpateForAiStart(dashBoardUpdateData, aiStartPos, boardStateMap, randomXorNums, updateDashBoardAtStart){
    if(!dashBoardUpdateData["isAiWhite"] || !updateDashBoardAtStart){
        return;
    }
    if(aiStartPos < 0.25){
        dashBoardUpdateData["originPos"] = "tile-6 0";
        dashBoardUpdateData["newPos"] = "tile-5 2";
    } else if (aiStartPos < 0.5){
        dashBoardUpdateData["originPos"] = "tile-1 0";
        dashBoardUpdateData["newPos"] = "tile-2 2";
    } else if (aiStartPos < 0.75){
        dashBoardUpdateData["originPos"] = "tile-3 1";
        dashBoardUpdateData["newPos"] = "tile-3 3";
    } else {
        dashBoardUpdateData["originPos"] = "tile-4 1";
        dashBoardUpdateData["newPos"] = "tile-4 3";
    }
    updatePastMoveDashBoard(dashBoardUpdateData);
    saveBoardState(boardStateMap, 0, randomXorNums);
}

function saveBoardState(boardStates, boardStrength, randomXorNums){
    let newBoardState = new Array();
    for(let y = 0; y < 8; y++){
        for(let x = 0; x < 8; x++){
            newBoardState.push(document.getElementById("tile-" + x + " " + y).name);
        }
    }
    newBoardState.push(boardStrength);
    newBoardState.push(generateBoardHashNum(convertToChessEngineBoard(), randomXorNums));
    boardStates.push(newBoardState);
}

function updateBoardState(boardStateNum, boardStates, areUpdatePaused){
    if(areUpdatePaused != -1 && areUpdatePaused != -2){
        return;
    }
    if(boardStateNum == -1){
        boardStateNum = boardStates.length - 1;
    }
    if(boardStateNum == 0){
        boardStates[boardStateNum][64]= 0;
    } else if (boardStates[boardStateNum][64] === undefined){
        boardStates[boardStateNum][64] = boardStates[boardStateNum - 1][64];
    }
    updateGameSrengthDisplay(boardStates[boardStateNum][64]);
    for(let y = 0; y < 8; y++){
        for(let x = 0; x < 8; x++){
            document.getElementById("tile-" + x + " " + y).name = boardStates[boardStateNum][y * 8 + x];
        }
    }
    if(document.getElementById("chessBoardChangeModal-Visible")){
        document.getElementById("chessBoardChangeModal-Visible").id = "chessBoardChangeModal-Hidden";
    }
    if(boardStateNum != boardStates.length - 1 && areUpdatePaused == -2){
        document.getElementById("chessBoardChangeModal-Hidden").id = "chessBoardChangeModal-Visible";
    }
    killedPieceDisplayHandler()
}

function yesConfirmBoardChangeButton(dashBoardUpdateData, revertTo, boardStates, hashedBoardWeights, randomXorNums, hashedNumOfBoardRepitions){
    let newBoardNum = Number(revertTo[0])
    document.getElementById("chessBoardChangeModal-Visible").id = "chessBoardChangeModal-Hidden";
    hideEndOfGameModals();
    let numOfDeletions = dashBoardUpdateData["curMoveNum"] - newBoardNum;
    delMoveOnDashBoard(numOfDeletions, boardStates, hashedNumOfBoardRepitions, dashBoardUpdateData)
    hashedNumOfBoardRepitions.set(boardStates[boardStates.length - 1][65], Math.max(hashedNumOfBoardRepitions.get(boardStates[boardStates.length - 1][65]) - 1, 0));
    if((dashBoardUpdateData["isAiWhite"] && newBoardNum % 2) || !(dashBoardUpdateData["isAiWhite"] || newBoardNum % 2)){
        launchChessEngine(hashedBoardWeights, randomXorNums, hashedNumOfBoardRepitions, dashBoardUpdateData, boardStates);
    }
}

function noConfirmBoardChangeButton(boardStates){
    document.getElementById("chessBoardChangeModal-Visible").id = "chessBoardChangeModal-Hidden";
    updateBoardState(boardStates.length - 1, boardStates, -1);
}

function ConfirmBoardChangeModal(boardStates, dashBoardUpdateData, revertTo, hashedBoardWeights, randomXorNums, hashedNumOfBoardRepitions){
    return(
        <div id = "chessBoardChangeModal-Hidden">
            <div id = "chessBoardChangeInnerModal">
                <p id = "chessBoardChangeText">Confirm Board Change?</p>
                <button id = "chessBoardChangeYesButton" className = "chessBoardChangeButton" onClick = {function(){yesConfirmBoardChangeButton(dashBoardUpdateData, revertTo, boardStates, hashedBoardWeights, randomXorNums, hashedNumOfBoardRepitions)}}>Yes</button>
                <button id = "chessBoardChangeNoButton" className = "chessBoardChangeButton" onClick = {function(){noConfirmBoardChangeButton(boardStates)}}>No</button>
            </div>
        </div>
    )
}

function pastMoveDashBoard(boardStates, revertTo){
    let pastMovesContainer = [];
    for(let pastMovesPos = 0; pastMovesPos < 250; pastMovesPos++){
        pastMovesContainer.push(<button type = "button" draggable = "false" className = "chessPastMovesButton" id = {"chessStateButton-" + pastMovesPos} style={{ display : "none" }}
            onClick = {(event) => updateBoardState(revertTo[0] = event.target.id.split("-")[1], boardStates, -1)}
            onMouseOver = {(event) => updateBoardState(event.target.id.split("-")[1], boardStates, revertTo[0])}
        />);
    }
    return(
    <div id = "chessPastMoveDashBoard">
        <h2 id = "chessPastMovesHeadding">MOVES</h2>
        <div id = "chessPastMoveContainer" 
            onMouseEnter = {function () {revertTo[0] = -1}}
            onPointerLeave = {function () {updateBoardState(revertTo[0], boardStates, -2)}}>
            {pastMovesContainer}
        </div>
    </div>
    );
}

//GAME STRENGTH DISPLAY---------------------------------------------------------------------------------------------------------------------------------------------------------

function updateGameStrengthDisplayColor(dashBoardUpdateData){
    if(dashBoardUpdateData["isAiWhite"]){
        document.getElementById("chessGameStrengthLine").style.backgroundColor = "black";
        document.getElementById("chessGameStrengthContainer").style.backgroundColor = "white";
    } else {
        document.getElementById("chessGameStrengthLine").style.backgroundColor = "white";
        document.getElementById("chessGameStrengthContainer").style.backgroundColor = "black";
    }
}

function updateGameSrengthDisplay(newStrengthVal){
    if(newStrengthVal === undefined){
        newStrengthVal = document.getElementById("chessGameStrengthScore").innerHTML;
    }
    newStrengthVal *= -1;
    if(newStrengthVal > 5000){
        newStrengthVal = 5000;
    }
    if (newStrengthVal < -5000){
        newStrengthVal = -5000;
    }
    document.getElementById("chessGameStrengthScore").innerHTML = newStrengthVal;
    if(newStrengthVal < 1000 && newStrengthVal > -1000){
        document.getElementById("chessGameStrengthLine").style.height = (39 + newStrengthVal * 0.039) + "vh";
    } else if(newStrengthVal >= 1000){
        document.getElementById("chessGameStrengthLine").style.height = "79vh";
    } else {
        document.getElementById("chessGameStrengthLine").style.height = "1vh";
    }
}

function gameStrengthDisplay(dashBoardUpdateData){
    let aiColor, playerColor;
    if(dashBoardUpdateData["isAiWhite"]){
        aiColor = "white";
        playerColor = "black";
    } else {
        aiColor = "black";
        playerColor = "white";
    }
    return(
        <div>
            <div id = "chessGameStrengthContainer" style = {{backgroundColor: aiColor}}/>
            <p id = "chessGameStrengthLine" style = {{backgroundColor: playerColor, height: "39vh"}}></p>
            <p id = "chessGameStrengthScore">0</p>
        </div>
        
    );
}

//PAWNS---------------------------------------------------------------------------------------------------------------------------------------------------------

function updatePawnUpgradeButtons(isAiWhite){
    let playerColor, otherPlayerColor;
    isAiWhite ? playerColor = "black" : playerColor = "white";
    isAiWhite ? otherPlayerColor = "white" : otherPlayerColor = "black";
    if(document.getElementById(otherPlayerColor + "PawnToQueenButton")){
        document.getElementById(otherPlayerColor + "PawnToQueenButton").id = playerColor + "PawnToQueenButton";
        document.getElementById(otherPlayerColor + "PawnToRookButton").id = playerColor + "PawnToRookButton";
        document.getElementById(otherPlayerColor + "PawnToKnightButton").id = playerColor + "PawnToKnightButton";
        document.getElementById(otherPlayerColor + "PawnToBishopButton").id = playerColor + "PawnToBishopButton";
    }
}

function pawnUpgradeButtons(hashedBoardWeights, randomXorNums, hashedNumOfBoardRepitions, dashBoardUpdateData, boardStates) {
    let playerColor;
    dashBoardUpdateData["isAiWhite"] === 1 ? playerColor = "black" : playerColor = "white";
    return (
        <div id= "pawnUpgradeModal-hidden">
            <div id= "pawnUpgradeList">
                <button type= "button" draggable= "false" className= "pawnUpgradeButtons" id={playerColor + "PawnToQueenButton"} onMouseDown={function () { pawnUpgradeClicked("Queen", hashedBoardWeights, randomXorNums, hashedNumOfBoardRepitions, dashBoardUpdateData, boardStates) }} />
                <button type= "button" draggable= "false" className= "pawnUpgradeButtons" id={playerColor + "PawnToRookButton"} onMouseDown={function () { pawnUpgradeClicked("Rook", hashedBoardWeights, randomXorNums, hashedNumOfBoardRepitions, dashBoardUpdateData, boardStates) }} />
                <button type= "button" draggable= "false" className= "pawnUpgradeButtons" id={playerColor + "PawnToKnightButton"} onMouseDown={function () { pawnUpgradeClicked("Knight", hashedBoardWeights, randomXorNums, hashedNumOfBoardRepitions, dashBoardUpdateData, boardStates) }} />
                <button type= "button" draggable= "false" className= "pawnUpgradeButtons" id={playerColor + "PawnToBishopButton"} onMouseDown={function () { pawnUpgradeClicked("Bishop", hashedBoardWeights, randomXorNums, hashedNumOfBoardRepitions, dashBoardUpdateData, boardStates) }} />
            </div>
        </div>
    );
}

function pawnUpgradeClicked(pieceName, hashedBoardWeights, randomXorNums, hashedNumOfBoardRepitions, dashBoardUpdateData, boardStates) {
    let playerColor;
    dashBoardUpdateData["isAiWhite"] === 1 ? playerColor = "black" : playerColor = "white";
    document.getElementById("pawnUpgradeModal-visible").id = "pawnUpgradeModal-hidden";
    let curXPos = Math.abs(Math.ceil((parseInt(document.getElementById("pawnUpgradeList").style.left.split("v")[0]) - 10.6) / 10.225));
    document.getElementById("tile-" + curXPos + " 0").name = playerColor + pieceName + "-isUser";
    saveBoardState(boardStates, undefined, randomXorNums);
    killedPieceDisplayHandler()
    launchChessEngine(hashedBoardWeights, randomXorNums, hashedNumOfBoardRepitions, dashBoardUpdateData, boardStates);
}

function pawnUpdates(e, pieceInCursor) {
    if (!pieceInCursor.includes("Pawn")) {
        return;
    }
    let curPos = new Array(parseInt(e.target.id.split("-")[1].split(" ")[0]), parseInt(e.target.id.split("-")[1].split(" ")[1]));
    if (curPos[1] === 0) {
        document.getElementById("pawnUpgradeList").style.left = (10.6 + e.target.id.split("-")[1].split(" ")[0] * 10.225).toString() + "vh";
        document.getElementById("pawnUpgradeModal-hidden").id = "pawnUpgradeModal-visible";
        return (1);
    }
}

function clearEnPassant(){
    for (let yPos = 1; yPos < 6; yPos++) {
        for (let xPos = 0; xPos < 8; xPos++) {
            document.getElementById("tile-" + xPos + " " + yPos).name = document.getElementById("tile-" + xPos + " " + yPos).name.split(".")[0];
        }
    }
}

//GET MOVES---------------------------------------------------------------------------------------------------------------------------------------------------------


function canPieceMove(xPos, yPos, tileName, playerId) {
    let direction, kingPos = new Array(0, 8), pieceOriginId = "tile-" + xPos + " " + yPos;
    playerId.includes("isAi") ? direction = 1 : direction = -1;
    for (kingPos[0] = 0; kingPos[1] === 8 && kingPos[0] < 8; kingPos[0]++) {
        for (kingPos[1] = 0; kingPos[1] < 8 && !document.getElementById("tile-" + kingPos[0] + " " + kingPos[1]).name.includes("King-" + playerId); kingPos[1]++);
    }
    kingPos[0]--;
    switch (tileName.split("-")[0].substring(5)) {
        case "Pawn":
            if (checkIfValidMove("tile-" + xPos + " " + (yPos + 1 * direction).toString(), pieceOriginId, tileName, playerId) ||
                checkIfValidMove("tile-" + xPos + " " + (yPos + 2 * direction).toString(), pieceOriginId, tileName, playerId) ||
                checkIfValidMove("tile-" + (xPos + 1).toString() + " " + (yPos + 1 * direction).toString(), pieceOriginId, tileName, playerId) ||
                checkIfValidMove("tile-" + (xPos - 1).toString() + " " + (yPos + 1 * direction).toString(), pieceOriginId, tileName, playerId)) {
                return (1);
            }
            break;
        case "Knight":
            for (let checkXPos = 2; checkXPos > -3; checkXPos--) {
                for (let checkYPos = 2; checkYPos > -3; checkYPos--) {
                    if (checkIfValidMove("tile-" + (xPos + checkXPos).toString() + " " + (yPos + checkYPos).toString(), pieceOriginId, tileName, playerId)) {
                        return (1);
                    }
                }
            }
            break;
        case "Bishop":
            for (let checkYPos = 0, checkXPos = 0; checkXPos < 8; checkXPos++, checkYPos++) {
                if (checkIfValidMove("tile-" + (xPos + checkXPos).toString() + " " + (yPos + checkYPos).toString(), pieceOriginId, tileName, playerId) ||
                    checkIfValidMove("tile-" + (xPos - checkXPos).toString() + " " + (yPos + checkYPos).toString(), pieceOriginId, tileName, playerId) ||
                    checkIfValidMove("tile-" + (xPos + checkXPos).toString() + " " + (yPos - checkYPos).toString(), pieceOriginId, tileName, playerId) ||
                    checkIfValidMove("tile-" + (xPos - checkXPos).toString() + " " + (yPos - checkYPos).toString(), pieceOriginId, tileName, playerId)) {
                    return (1);
                }
            }
            break;
        case "Rook":
            for (let checkPos = -7; checkPos < 8; checkPos++) {
                if (checkIfValidMove("tile-" + (xPos + checkPos).toString() + " " + yPos, pieceOriginId, tileName, playerId) ||
                    checkIfValidMove("tile-" + xPos + " " + (yPos + checkPos).toString(), pieceOriginId, tileName, playerId)) {
                    return (1);
                }
            }
            break;
        case "Queen":
            for (let checkYPos = -8, checkXPos = -8; checkXPos < 8; checkXPos++, checkYPos++) {
                if (checkIfValidMove("tile-" + (xPos + checkXPos).toString() + " " + (yPos + checkYPos).toString(), pieceOriginId, tileName, playerId) ||
                    checkIfValidMove("tile-" + (xPos - checkXPos).toString() + " " + (yPos + checkYPos).toString(), pieceOriginId, tileName, playerId) ||
                    checkIfValidMove("tile-" + (xPos + checkXPos).toString() + " " + (yPos - checkYPos).toString(), pieceOriginId, tileName, playerId) ||
                    checkIfValidMove("tile-" + (xPos + checkXPos).toString() + " " + yPos, pieceOriginId, tileName, playerId) ||
                    checkIfValidMove("tile-" + xPos + " " + (yPos + checkXPos).toString(), pieceOriginId, tileName, playerId)) {
                    return (1);
                }
            }
            break;
        case "King":
            for (let checkXPos = -1; checkXPos < 2; checkXPos++) {
                for (let checkYPos = -1; checkYPos < 2; checkYPos++) {
                    if ((checkXPos || checkYPos) && checkIfValidMove("tile-" + (xPos + checkXPos).toString() + " " + (yPos + checkYPos).toString(), pieceOriginId, tileName, playerId)) {
                        return (1);
                    }
                }
            }
            break;
        default:
    }
}

function isDirectionCheckingTile(curPos, xDirection, yDirection, otherPlayerId) {
    if (curPos[0] + xDirection < 8 && curPos[0] + xDirection >= 0 && curPos[1] + yDirection < 8 && curPos[1] + yDirection >= 0 &&
        document.getElementById("tile-" + (curPos[0] + xDirection).toString() + " " + (curPos[1] + yDirection).toString()).name.includes("King-" + otherPlayerId)) {
        return (1);
    }
    for (let xIncrease = xDirection, yIncrease = yDirection; curPos[0] + xDirection < 8 && curPos[0] + xDirection >= 0 && curPos[1] + yDirection < 8 && curPos[1] + yDirection >= 0; xDirection += xIncrease, yDirection += yIncrease) {
        let checkTileName = document.getElementById("tile-" + (curPos[0] + xDirection).toString() + " " + (curPos[1] + yDirection).toString()).name;
        if (xDirection && Math.abs(xDirection) === Math.abs(yDirection) && (checkTileName.includes("Bishop-" + otherPlayerId) || checkTileName.includes("Queen-" + otherPlayerId))) {
            return (1);
        } else if ((xDirection === 0 || yDirection === 0) && xDirection !== yDirection && (checkTileName.includes("Rook-" + otherPlayerId) || checkTileName.includes("Queen-" + otherPlayerId))) {
            return (1);
        } else if (!checkTileName.includes("emptyTile")) {
            return (0);
        }
    }
}

function isTileChecked(curPos, otherPlayerId) {
    let playerDirection;
    otherPlayerId === "isUser" ? playerDirection = 1 : playerDirection = -1;
    if (curPos[1] + 1 * playerDirection < 8 && curPos[1] + 1 * playerDirection >= 0 && ((curPos[0] < 7 &&
        document.getElementById("tile-" + (curPos[0] + 1).toString() + " " + (curPos[1] + 1 * playerDirection).toString()).name.includes("Pawn-" + otherPlayerId)) ||
        (curPos[0] > 0 && document.getElementById("tile-" + (curPos[0] - 1).toString() + " " + (curPos[1] + 1 * playerDirection).toString()).name.includes("Pawn-" + otherPlayerId)))) {
        return (1);
    }
    for (let xDirection = -2; xDirection < 3; xDirection++) {
        for (let yDirection = -2; yDirection < 3; yDirection++) {
            if (((xDirection || yDirection) && xDirection < 2 && xDirection > -2 && yDirection < 2 && yDirection > -2 && isDirectionCheckingTile(curPos, xDirection, yDirection, otherPlayerId)) ||                               //Straight && Diagonal
                ((Math.abs(xDirection) === 2 || Math.abs(yDirection) === 2) && (Math.abs(xDirection) === 1 || Math.abs(yDirection) === 1) && curPos[0] + xDirection >= 0 && curPos[0] + xDirection < 8 &&                                   //Knight pt 1
                    curPos[1] + yDirection >= 0 && curPos[1] + yDirection < 8 && document.getElementById("tile-" + (curPos[0] + xDirection).toString() + " " + (curPos[1] + yDirection).toString()).name.includes("Knight-" + otherPlayerId))) {   //Knight pt 2
                return (1);
            }
        }
    }
}

function isKingChecked(curId, curPiece, playerId, otherPlayerId, pieceOriginId) {
    let curPos = new Array(0, 8), previousName = document.getElementById(curId).name, previousTileName = document.getElementById(pieceOriginId).name;
    document.getElementById(curId).name = curPiece;
    document.getElementById(pieceOriginId).name = "emptyTile";
    for (curPos[0] = 0; curPos[1] === 8 && curPos[0] < 8; curPos[0]++) {
        for (curPos[1] = 0; curPos[1] < 8 && !document.getElementById("tile-" + curPos[0] + " " + curPos[1]).name.includes("King-" + playerId); curPos[1]++);
    }
    let isCheckedOutput = isTileChecked([--curPos[0], curPos[1]], otherPlayerId);
    document.getElementById(curId).name = previousName;
    document.getElementById(pieceOriginId).name = previousTileName;
    return (isCheckedOutput);
}

function checkIfValidMove(curId, pieceOriginId, curPiece, playerId) {
    let playerDirection, curPos = new Array(parseInt(curId.split("-")[1].split(" ")[0]), parseInt(curId.split("-")[1].split(" ")[1]));             // 0 = x && y = 1
    let otherPlayerId = getOtherPlayerId(playerId);
    let originPos = new Array(parseInt(pieceOriginId.split("-")[1].split(" ")[0]), parseInt(pieceOriginId.split("-")[1].split(" ")[1]));
    playerId === "isAi" ? playerDirection = -1 : playerDirection = 1;
    if (curPos[0] < 0 || curPos[0] > 7 || curPos[1] < 0 || curPos[1] > 7 || curId.includes("--") || curId.includes(" -") || (originPos[0] === curPos[0] && originPos[1] === curPos[1]) ||
        isKingChecked(curId, curPiece, playerId, otherPlayerId, pieceOriginId) || (document.getElementById(curId).name.includes(playerId) && !curPiece.includes("King"))) {
        return;
    }
    if (curPiece.includes("Pawn")) {
        if ((originPos[0] === curPos[0] && document.getElementById("tile-" + originPos[0].toString() + " " + (originPos[1] - 1 * playerDirection).toString()).name.includes("emptyTile") && (originPos[1] - 1 * playerDirection === curPos[1] ||                //Move forward 1
            (((originPos[1] === 6 && playerId === "isUser") || (originPos[1] === 1 && playerId === "isAi")) && originPos[1] - 2 * playerDirection === curPos[1] && document.getElementById("tile-" + originPos[0].toString() + " " + (originPos[1] - 2 * playerDirection).toString()).name.includes("emptyTile")))) || //Move forward 2
            (originPos[0] + 1 * playerDirection === curPos[0] && document.getElementById("tile-" + (originPos[0] + 1 * playerDirection).toString() + " " + (originPos[1] - 1 * playerDirection).toString()).name.includes(otherPlayerId) && originPos[1] - 1 * playerDirection === curPos[1]) || //Attack right
            (originPos[0] - 1 * playerDirection === curPos[0] && document.getElementById("tile-" + (originPos[0] - 1 * playerDirection).toString() + " " + (originPos[1] - 1 * playerDirection).toString()).name.includes(otherPlayerId) && originPos[1] - 1 * playerDirection === curPos[1]) || //Attack left
            (originPos[0] + 1 === curPos[0] && document.getElementById("tile-" + (originPos[0] + 1).toString() + " 3").name.includes(".enPassant") && originPos[1] === 3 && curPos[1] === 2) ||    //En passant right
            (originPos[0] - 1 === curPos[0] && document.getElementById("tile-" + (originPos[0] - 1).toString() + " 3").name.includes(".enPassant") && originPos[1] === 3 && curPos[1] === 2)) {     //En passant left
            return (1);
        }
    } else if (curPiece.includes("Rook")) {
        let xDistance = curPos[0] - originPos[0], yDistance = curPos[1] - originPos[1], adjustDistance;
        if (xDistance !== 0 && yDistance === 0) {
            xDistance > 0 ? adjustDistance = 1 : adjustDistance = -1;
            for (let moveDistance = Math.abs(xDistance) - 1; moveDistance > 0; moveDistance--) {
                if (!document.getElementById("tile-" + (originPos[0] + moveDistance * adjustDistance).toString() + " " + originPos[1]).name.includes("emptyTile")) {
                    return;
                }
            }
            return (1);
        } else if (xDistance === 0 && yDistance !== 0) {
            yDistance > 0 ? adjustDistance = 1 : adjustDistance = -1;
            for (let moveDistance = Math.abs(yDistance) - 1; moveDistance > 0; moveDistance--) {
                if (!document.getElementById("tile-" + originPos[0] + " " + (originPos[1] + moveDistance * adjustDistance).toString()).name.includes("emptyTile")) {
                    return;
                }
            }
            return (1);
        }
    } else if (curPiece.includes("Knight")) {
        if (((originPos[0] + 2 === curPos[0] || originPos[0] - 2 === curPos[0]) && (originPos[1] + 1 === curPos[1] || originPos[1] - 1 === curPos[1])) ||
            ((originPos[1] + 2 === curPos[1] || originPos[1] - 2 === curPos[1]) && (originPos[0] + 1 === curPos[0] || originPos[0] - 1 === curPos[0]))) {
            return (1);
        }
    } else if (curPiece.includes("Bishop")) {
        let adjustX, adjustY, moveDistance = Math.abs(originPos[0] - curPos[0]);
        if (moveDistance !== Math.abs(originPos[1] - curPos[1])) {
            return;
        }
        curPos[0] - originPos[0] > 0 ? adjustX = 1 : adjustX = -1;
        curPos[1] - originPos[1] > 0 ? adjustY = 1 : adjustY = -1;
        for (let checkDistance = 1; checkDistance < moveDistance; checkDistance++) {
            if (!document.getElementById("tile-" + (originPos[0] + checkDistance * adjustX).toString() + " " + (originPos[1] + checkDistance * adjustY).toString()).name.includes("emptyTile")) {
                return;
            }
        }
        return (1);
    } else if (curPiece.includes("Queen")) {
        let xDistance = curPos[0] - originPos[0], yDistance = curPos[1] - originPos[1], adjustDistance;
        if (xDistance !== 0 && yDistance === 0) {
            xDistance > 0 ? adjustDistance = 1 : adjustDistance = -1;
            for (let moveDistance = Math.abs(xDistance) - 1; moveDistance > 0; moveDistance--) {
                if (!document.getElementById("tile-" + (originPos[0] + moveDistance * adjustDistance).toString() + " " + originPos[1]).name.includes("emptyTile")) {
                    return;
                }
            }
            return (1);
        } else if (xDistance === 0 && yDistance !== 0) {
            yDistance > 0 ? adjustDistance = 1 : adjustDistance = -1;
            for (let moveDistance = Math.abs(yDistance) - 1; moveDistance > 0; moveDistance--) {
                if (!document.getElementById("tile-" + originPos[0] + " " + (originPos[1] + moveDistance * adjustDistance).toString()).name.includes("emptyTile")) {
                    return;
                }
            }
            return (1);
        }
        let adjustX, adjustY, moveDistance = Math.abs(originPos[0] - curPos[0]);
        if (moveDistance !== Math.abs(originPos[1] - curPos[1])) {
            return;
        }
        curPos[0] - originPos[0] > 0 ? adjustX = 1 : adjustX = -1;
        curPos[1] - originPos[1] > 0 ? adjustY = 1 : adjustY = -1;
        for (let checkDistance = 1; checkDistance < moveDistance; checkDistance++) {
            if (!document.getElementById("tile-" + (originPos[0] + checkDistance * adjustX).toString() + " " + (originPos[1] + checkDistance * adjustY).toString()).name.includes("emptyTile")) {
                return;
            }
        }
        return (1);
    } else if (curPiece.includes("King")) {
        if (Math.abs(originPos[0] - curPos[0]) < 2 && Math.abs(originPos[1] - curPos[1]) < 2 && !document.getElementById("tile-" + curPos[0] + " " + curPos[1]).name.includes(playerId)) {   //move 1 spot
            return (1);
        } else if (curPiece.includes(".canCastle") && document.getElementById("tile-" + curPos[0] + " " + curPos[1]).name.includes(".canCastle")) {
            let adjustDistance, moveDistance = curPos[0] - originPos[0];
            moveDistance > 0 ? adjustDistance = 1 : adjustDistance = -1;
            for (let curDistance = 1; Math.abs(moveDistance) - curDistance > 0; curDistance++) {
                if (!document.getElementById("tile-" + (originPos[0] + curDistance * adjustDistance).toString() + " " + originPos[1]).name.includes("emptyTile")) {
                    return;
                }
            }
            if(!isTileChecked([originPos[0] + 1 * adjustDistance, originPos[1]], otherPlayerId) && !isTileChecked([originPos[0] + 2 * adjustDistance, originPos[1]], otherPlayerId)){
                return (1);
            }
        }
    }
}

//GAME OVER---------------------------------------------------------------------------------------------------------------------------------------------------------

function checkIfThreeRepititions(hashedNumOfBoardRepitions, randomXorNums){
    let boardHashNum = generateBoardHashNum(convertToChessEngineBoard(), randomXorNums);
    let numOfRepitions = hashedNumOfBoardRepitions.get(boardHashNum);
    if(numOfRepitions){
        numOfRepitions++;
    } else {
        numOfRepitions = 1;
    }
    hashedNumOfBoardRepitions.set(boardHashNum, numOfRepitions);
    if(numOfRepitions === 3){
        return(1);
    }
    return(0);
}

function checkIfOutOfMaterial(){
    let whiteMin = 0, blackMin = 0;
    for (let xPos = 0; xPos < 8; xPos++) {
        for (let yPos = 0; yPos < 8; yPos++) {
            let tileName = document.getElementById("tile-" + xPos + " " + yPos).name;
            if(tileName !== "emptyTile" && !tileName.includes("King")){
                if(tileName.includes("Bishop") || tileName.includes("Knight")){
                    tileName.includes("white") ? whiteMin++ : blackMin++;
                } else {
                    return(0)
                }
            }
        }
    }
    if(whiteMin > 1 || blackMin > 1){
        return(0);
    }
    return(1);
}

function checkIfCanMove(playerId) {
    for (let xPos = 0; xPos < 8; xPos++) {
        for (let yPos = 0; yPos < 8; yPos++) {
            let tileName = document.getElementById("tile-" + xPos + " " + yPos).name;
            if (tileName.includes(playerId) && canPieceMove(xPos, yPos, tileName, playerId)) {
                return(1);
            }
        }
    }
    return (0);
}

function endOfGameActions(playerId, hashedNumOfBoardRepitions, randomXorNums) {
    if(checkIfOutOfMaterial() || checkIfThreeRepititions(hashedNumOfBoardRepitions, randomXorNums)){
        document.getElementById("stalemate-hidden").id = "stalemate-visible";
        return(1);
    }
    if (checkIfCanMove(playerId)) {
        return(0);
    }
    let kingPos = new Array(0, 8), otherPlayerId = getOtherPlayerId(playerId);
    for (kingPos[0] = 0; kingPos[1] === 8 && kingPos[0] < 8; kingPos[0]++) {
        for (kingPos[1] = 0; kingPos[1] < 8 && !document.getElementById("tile-" + kingPos[0] + " " + kingPos[1]).name.includes("King-" + playerId); kingPos[1]++);
    }
    kingPos[0]--;
    if (isTileChecked(kingPos, otherPlayerId)) {
        document.getElementById(otherPlayerId + "Wins-hidden").id = otherPlayerId + "Wins-visible";
        return(1);
    }
    document.getElementById("stalemate-hidden").id = "stalemate-visible";
    return(1);
}

function hideEndOfGameModals(){
    if(document.getElementById("stalemate-visible")){
        document.getElementById("stalemate-visible").id = "stalemate-hidden";
    }
    if(document.getElementById("isUserWins-visible")){
        document.getElementById("isUserWins-visible").id = "isUserWins-hidden";
    }
    if(document.getElementById("isAiWins-visible")){
        document.getElementById("isAiWins-visible").id = "isAiWins-hidden";
    }
    if(document.getElementById("gameOverModal")){
        if(!document.getElementById("stalemate-hidden")){
            document.getElementById("gameOverModal").id = "stalemate-hidden";
        } else if (!document.getElementById("isUserWins-hidden")){
            document.getElementById("gameOverModal").id = "isUserWins-hidden";
        } else {
            document.getElementById("gameOverModal").id = "isAiWins-hidden";
        }
    }
}

function displayWinner() {
    return (
        <div id= "displayWinner">
            <button id = "isUserWins-hidden" onClick={(event) => { event.target.id = "gameOverModal" }}>Player Wins</button>
            <button id = "isAiWins-hidden" onClick={(event) => { event.target.id = "gameOverModal" }}>AI Wins</button>
            <button id = "stalemate-hidden" onClick={(event) => { event.target.id = "gameOverModal" }}>Stalemate</button>
        </div>
    );
}

//ENGINE---------------------------------------------------------------------------------------------------------------------------------------------------------

function convertToChessEngineBoard() {
    let chessBoard = ({
        ["isUser"] : 0n,
        ["isAi"] : 0n,
        ["overflow"] : 0n,
        ["Pawn-isUser"] : 0n,
        ["Knight-isUser"] : 0n,
        ["Bishop-isUser"] : 0n,
        ["Rook-isUser"] : 0n,
        ["Queen-isUser"] : 0n,
        ["King-isUser"] : 0n,
        ["Pawn-isAi"] : 0n,
        ["Knight-isAi"] : 0n,
        ["Bishop-isAi"] : 0n,
        ["Rook-isAi"] : 0n,
        ["Queen-isAi"] : 0n,
        ["King-isAi"] : 0n,
        ["canCastle"] : 0n,
        ["enPassant"] : 0n,
    });
    for (let yPos = 0n; yPos < 8n; yPos++) {
        for (let xPos = 0n; xPos < 10n; xPos++) {
            if(!xPos || xPos === 9n){
                chessBoard["overflow"] |= 1n << (yPos * 10n + xPos);
                continue;
            }
            let tileName = document.getElementById("tile-" + (xPos - 1n).toString() + " " + yPos).name;
            if(tileName.includes("emptyTile")){
                continue; 
            }
            let curTileNum = yPos * 10n + xPos;
            chessBoard[tileName.substring(5).split("-")[0] + "-" + tileName.split("-")[1].split(".")[0]] |= 1n << curTileNum;
            tileName.includes("isUser") ? chessBoard["isUser"] |= 1n << curTileNum : chessBoard["isAi"] |= 1n << curTileNum;
            if(tileName.includes(".canCastle")){
                chessBoard["canCastle"] |= 1n << curTileNum;
            }
            if(tileName.includes(".enPassant")){
                chessBoard["enPassant"] |= 1n << curTileNum;
            }
        }
    }
    return (chessBoard);
}

function chessEngineMoveUpdate(chessEngineMove, dashBoardUpdateData, boardStates, randomXorNums) {
    if(!chessEngineMove){
        return;
    }
    chessEngineMove[0] = Number(chessEngineMove[0]);
    chessEngineMove[1] = Number(chessEngineMove[1]);
    let oldTileId = "tile-" + (chessEngineMove[0] % 10 - 1) + " " + Math.floor(chessEngineMove[0] / 10), newTileId = "tile-" + (chessEngineMove[1] % 10 - 1) + " " + Math.floor(chessEngineMove[1] / 10);
    let oldTileName = document.getElementById(oldTileId).name, newTileName = document.getElementById(newTileId).name;
    dashBoardUpdateData["originPos"] = oldTileId;
    dashBoardUpdateData["newPos"] = newTileId;
    updatePastMoveDashBoard(dashBoardUpdateData);
    updateGameSrengthDisplay(chessEngineMove[2]);
    if(oldTileName.includes("King") && newTileName.includes("Rook") && oldTileName.split("-")[1] === newTileName.split("-")[1]){//Castles
        let modifyPos;
        chessEngineMove[0] > chessEngineMove[1] ? modifyPos = -1 : modifyPos = 1;
        document.getElementById("tile-" + (chessEngineMove[0] % 10 - 1 + 2 * modifyPos) + " " + Math.floor(chessEngineMove[0] / 10)).name = oldTileName.split(".")[0];
        document.getElementById("tile-" + (chessEngineMove[0] % 10 - 1 + 1 * modifyPos) + " " + Math.floor(chessEngineMove[0] / 10)).name = newTileName.split(".")[0];
        document.getElementById(newTileId).name = "emptyTile";
        document.getElementById(oldTileId).name = "emptyTile";
        clearEnPassant();
        saveBoardState(boardStates, chessEngineMove[2], randomXorNums);
        killedPieceDisplayHandler()
        return;
    }
    if(oldTileName.includes("Pawn") && (chessEngineMove[1] - chessEngineMove[0] === 9 || chessEngineMove[1] - chessEngineMove[0] === 11) && newTileName === "emptyTile"){   //en Passant
        let enPassantKill = "tile-" + (chessEngineMove[1] % 10 - 1) + " " + Math.floor(chessEngineMove[1] / 10 - 1)
        document.getElementById(enPassantKill).name = "emptyTile";
    }
    if (oldTileName.includes("Pawn") && Math.floor(chessEngineMove[1] / 10) === 7){
        document.getElementById(newTileId).name = oldTileName.split("P")[0] + "Queen-isAi";
    } else {
        document.getElementById(newTileId).name = oldTileName.split(".")[0];
    }
    document.getElementById(oldTileId).name = "emptyTile";
    clearEnPassant();
    if(Math.abs(chessEngineMove[0] - chessEngineMove[1]) === 20 && oldTileName.includes("Pawn")){
        document.getElementById(newTileId).name += ".enPassant";
    }
    saveBoardState(boardStates, chessEngineMove[2], randomXorNums);
    killedPieceDisplayHandler()
}

function launchChessEngine(hashedBoardWeights, randomXorNums, hashedNumOfBoardRepitions, dashBoardUpdateData, boardStates) {
    if(!endOfGameActions("isAi", hashedNumOfBoardRepitions, randomXorNums)){
        chessEngineMoveUpdate(ChessEngine(convertToChessEngineBoard(), hashedBoardWeights, randomXorNums), dashBoardUpdateData, boardStates, randomXorNums);
        endOfGameActions("isUser", hashedNumOfBoardRepitions, randomXorNums);
    }
}

//MOUSE---------------------------------------------------------------------------------------------------------------------------------------------------------

function updateMousePiece(e, pieceOriginId, pieceInCursor) {
    document.body.removeChild(document.getElementById("pieceInMouseId"));
    window.removeEventListener("mousemove", mouseMovePieceListener);
    document.getElementById(pieceOriginId).style.border = "0px";
    if (!e.target.name.includes("Rook-isUser")) {
        if(pieceInCursor.includes("Pawn") && document.getElementById(e.target.id).name === "emptyTile" && Math.abs(Number(document.getElementById(e.target.id).id.split("-")[1].split(" ")[0]) - Number(pieceOriginId.split("-")[1].split(" ")[0]))){
            document.getElementById(e.target.id.split(" ")[0] + " 3").name = "emptyTile";
        }
        if(pieceInCursor.includes("Pawn") && 2 === Math.abs(Number(document.getElementById(e.target.id).id.split(" ")[1]) - Number(pieceOriginId.split(" ")[1]))){
            pieceInCursor += ".enPassant";
        }
        document.getElementById(e.target.id).name = pieceInCursor;
        return;
    }
    if (parseInt(e.target.id.split("-")[1].split(" ")[0])) {  //right castle
        document.getElementById("tile-6 7").name = pieceInCursor;
        document.getElementById("tile-5 7").name = document.getElementById("tile-7 7").name;
        document.getElementById("tile-7 7").name = "emptyTile";
    } else {                                                //left castle
        document.getElementById("tile-2 7").name = pieceInCursor;
        document.getElementById("tile-3 7").name = document.getElementById("tile-0 7").name;
        document.getElementById("tile-0 7").name = "emptyTile";
    }
}

function clearMousePiece(pieceOriginId, pieceInCursor) {
    
    if(pieceOriginId === undefined || document.getElementById(pieceOriginId).style.border === "0px"){
        return;
    }
    if(document.getElementById("pieceInMouseId") !== null){
        document.body.removeChild(document.getElementById("pieceInMouseId"));
    }
    window.removeEventListener("mousemove", mouseMovePieceListener);

    document.getElementById(pieceOriginId).style.border = "0px";
    document.getElementById(pieceOriginId).name = pieceInCursor;
}

function releasePiece(e, pieceOriginId, pieceInCursor, hashedBoardWeights, randomXorNums, isMouseDraggingImage, hashedNumOfBoardRepitions, dashBoardUpdateData, boardStates) {
    if(pieceInCursor === "emptyTile" || !isMouseDraggingImage || !document.getElementById(pieceOriginId).name.includes("emptyTile")){
        return;
    }
    if (checkIfValidMove(e.target.id, pieceOriginId, pieceInCursor, "isUser")) {
        dashBoardUpdateData["originPos"] = pieceOriginId;
        dashBoardUpdateData["newPos"] = e.target.id;
        clearEnPassant();
        if (pieceInCursor.includes(".canCastle")) {
            pieceInCursor = pieceInCursor.split(".")[0];
        }
        updateMousePiece(e, pieceOriginId, pieceInCursor);
        updatePastMoveDashBoard(dashBoardUpdateData);
        if (pawnUpdates(e, pieceInCursor)) {
            return;
        }
        saveBoardState(boardStates, undefined, randomXorNums);
        killedPieceDisplayHandler()
        launchChessEngine(hashedBoardWeights, randomXorNums, hashedNumOfBoardRepitions, dashBoardUpdateData, boardStates);
    } else {
        clearMousePiece(pieceOriginId, pieceInCursor);
    }
}

function moveMousePieceToCursor(event, cursorImage) {
    cursorImage.style.position = "absolute";
    cursorImage.style.width = 8 + "vh";
    cursorImage.style.height = 8 + "vh";
    cursorImage.style.left = (event.x - document.documentElement.clientHeight * 0.04) + "px";
    cursorImage.style.top = (event.y - document.documentElement.clientHeight * 0.04) + "px";
    cursorImage.draggable = false;
    cursorImage.style.pointerEvents = "none";
    cursorImage.id = "pieceInMouseId";
    document.body.appendChild(cursorImage);
}

function selectPiece(e, pieceOriginId, pieceInCursor, cursorImage, isMouseDraggingImage) {
    if (isMouseDraggingImage) {
        clearMousePiece(pieceOriginId, pieceInCursor);
    }
    cursorImage = document.createElement("img");
    pieceInCursor = e.target.name;
    pieceOriginId = e.target.id;
    if (!pieceInCursor.includes("-isUser")) {
        return ([pieceOriginId, pieceInCursor, cursorImage]);
    }
    cursorImage.src = getImageSource(pieceInCursor.split("-")[0]);
    e.target.name = "emptyTile";
    e.target.style.border = "0.2vh solid red";
    window.addEventListener("mousemove", mouseMovePieceListener = (event => {moveMousePieceToCursor(event, cursorImage) }));
    return ([pieceOriginId, pieceInCursor, cursorImage, isMouseDraggingImage = 1]);
}

//GENERAL---------------------------------------------------------------------------------------------------------------------------------------------------------

function getImageSource(imageName) {
    switch (imageName.split("-")[0]) {
        case "whitePawn":
            return (whitePawn);
        case "whiteRook":
            return (whiteRook);
        case "whiteKnight":
            return (whiteKnight);
        case "whiteBishop":
            return (whiteBishop);
        case "whiteQueen":
            return (whiteQueen);
        case "whiteKing":
            return (whiteKing);
        case "blackPawn":
            return (blackPawn);
        case "blackRook":
            return (blackRook);
        case "blackKnight":
            return (blackKnight);
        case "blackBishop":
            return (blackBishop);
        case "blackQueen":
            return (blackQueen);
        case "blackKing":
            return (blackKing);
        default:
    }
}

function getTileName(isPosWhite, x, y, isAiWhite, aiStartPos) {
    let userIdText = "-isAi";
    if (y > 5) {
        userIdText = "-isUser";
    }
    switch (y) {
        case 6:
            isPosWhite = Math.abs(isPosWhite - 1);
        case 1:
            if (isPosWhite) {
                if(isAiWhite && ((x === 3 && aiStartPos >= 0.5 && aiStartPos < 0.75) || (isAiWhite && x === 4 && aiStartPos >= 0.75))){
                    return("emptyTile");
                }
                return ("whitePawn" + userIdText);
            }
            return ("blackPawn" + userIdText);
        case 7:
            isPosWhite = Math.abs(isPosWhite - 1);
        case 0:
            switch (x) {
                case 0:
                case 7:
                    if (isPosWhite) {
                        return ("whiteRook" + userIdText + ".canCastle");
                    }
                    return ("blackRook" + userIdText + ".canCastle")
                case 1:
                case 6:
                    if (isPosWhite && !(isAiWhite && aiStartPos >= 0.25 && aiStartPos < 0.5 && x === 1) && !(isAiWhite && aiStartPos < 0.25 && x === 6)) {
                        return ("whiteKnight" + userIdText);
                    } else if (isPosWhite){
                        return("emptyTile");
                    }
                    return ("blackKnight" + userIdText)
                case 2:
                case 5:
                    if (isPosWhite) {
                        return ("whiteBishop" + userIdText);
                    }
                    return ("blackBishop" + userIdText);
                case 3:
                    if (isPosWhite) {
                        return ("whiteQueen" + userIdText);
                    }
                    return ("blackQueen" + userIdText);
                case 4:
                    if (isPosWhite) {
                        return ("whiteKing" + userIdText + ".canCastle");
                    }
                    return ("blackKing" + userIdText + ".canCastle");
                default:
            }
        case 2:
            if((isAiWhite && aiStartPos >= 0.25 && aiStartPos < 0.5 && x === 2) || (isAiWhite && aiStartPos < 0.25 && x === 5)){
                return("whiteKnight" + userIdText);
            }
            return ("emptyTile");
        case 3:
            if(isAiWhite && ((x === 3 && aiStartPos >= 0.5 && aiStartPos < 0.75) || (isAiWhite && x === 4 && aiStartPos >= 0.75))){
                return("whitePawn" + userIdText);
            }
            return ("emptyTile");
        default:
            return ("emptyTile");
    }
}

export default function Chess() {
    let isAiWhite, pieceOriginId, pieceInCursor, cursorImage, isMouseDraggingImage = 0, aiStartPos = Math.random(), revertTo = [0], updateDashBoardAtStart = 1, dashBoardUpdateData = [];
    Math.random() < 0.5 ? isAiWhite = 0 : isAiWhite = 1;
    dashBoardUpdateData["curMoveNum"] = -1;
    dashBoardUpdateData["isAiWhite"] = isAiWhite;
    let chessBoard = [], tileColor = "lightgray";
    let boardStates = new Array(), hashedBoardWeights = new Map(), hashedNumOfBoardRepitions = new Map(), randomXorNums = generateRandomXorNums();
    for (let y = 0; y < 8; y++) {
        tileColor === "darkgreen" ? tileColor = "lightgray" : tileColor = "darkgreen";
        for (let x = 0; x < 8; x++) {
            tileColor === "darkgreen" ? tileColor = "lightgray" : tileColor = "darkgreen";
            chessBoard.push(<button type = "button" draggable = "false" className = "chessTile" id = {"tile-" + x + " " + y}
                name = {getTileName(isAiWhite, x, y, isAiWhite, aiStartPos)} style={{ backgroundColor: tileColor }}
                onMouseDown = {(event) => {dashBoardUpateForAiStart(dashBoardUpdateData, aiStartPos, boardStates, randomXorNums, updateDashBoardAtStart); updateDashBoardAtStart = 0; [pieceOriginId, pieceInCursor, cursorImage, isMouseDraggingImage] = selectPiece(event, pieceOriginId, pieceInCursor, cursorImage, isMouseDraggingImage)}}
                onMouseUp = {(event) => {releasePiece(event, pieceOriginId, pieceInCursor, hashedBoardWeights, randomXorNums, isMouseDraggingImage, hashedNumOfBoardRepitions, dashBoardUpdateData, boardStates); isMouseDraggingImage = 0 }} 
            />);
        }
    }
    return (
        <div>
            <div id= "chessBoard" onMouseLeave = {function () {clearMousePiece(pieceOriginId, pieceInCursor); isMouseDraggingImage = 0 }}
                onMouseUp = {function () { clearMousePiece(pieceOriginId, pieceInCursor); isMouseDraggingImage = 0 }}>
                {chessBoard}
            </div>
            {pawnUpgradeButtons(hashedBoardWeights, randomXorNums, hashedNumOfBoardRepitions, dashBoardUpdateData, boardStates)}
            {displayWinner()}
            {gameStrengthDisplay(dashBoardUpdateData)}
            {displayKilledPieces()}
            {pastMoveDashBoard(boardStates, revertTo)}
            {ConfirmBoardChangeModal(boardStates, dashBoardUpdateData, revertTo, hashedBoardWeights, randomXorNums, hashedNumOfBoardRepitions)}
            <button className = "chessControlButtons" id = "chessUndoButton" onClick = {function() {undoMove(dashBoardUpdateData, boardStates, hashedNumOfBoardRepitions, randomXorNums, hashedBoardWeights)}}>UNDO</button>
            <button className = "chessControlButtons" id = "chessNewGameButton" onClick = {function () {Math.random() < 0.5 ? dashBoardUpdateData["isAiWhite"] = 1 : dashBoardUpdateData["isAiWhite"] = 0; aiStartPos = Math.random(); updateDashBoardAtStart = 0; 
                newGameButton(aiStartPos, dashBoardUpdateData, boardStates, hashedNumOfBoardRepitions, randomXorNums)}}>NEW GAME</button>
        </div>
    );
}