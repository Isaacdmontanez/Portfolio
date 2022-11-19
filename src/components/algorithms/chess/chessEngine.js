/* eslint-disable default-case */
/* eslint-disable eqeqeq */
/* eslint-disable no-mixed-operators */
import {getAllValidMoves, getBoardNameFromTileNumber, movePiece, getCopyOfNumOfAttacks, getCopyOfChessBoard, getOtherPlayerId, isTileChecked } from "./engineFindMoves";
import {getBoardWeights} from "./engineGetBoardWeights";
import {updateAttackVals, buildAttackVals} from "./updateNumOfAttacks";
import {pieceWeight, castleBonus} from "./fixedBoardWeights";
import {generateBoardHashNum, updateHashVals} from "./zobristHashing";

function boardPosWeight(chessBoard, playerIdBoardWeight, playerId){
    let boardWeightVal = 0, checkPieceName;
    for(let i = 0n; i < 80n; i++){
        let activePlayer, adjustedBoardWeightPos = Number(i);
        if(chessBoard["isUser"] & 1n << i){
            activePlayer = "-isUser";
        } else if (chessBoard["isAi"] & 1n << i){
            activePlayer = "-isAi";
        } else {
            continue;
        }
        for (let testPiece = 0; testPiece < 6; testPiece++){
            switch (testPiece){
                case 0:
                    checkPieceName = "Pawn";
                    break;
                case 1:
                    checkPieceName = "Knight";
                    break;
                case 2:
                    checkPieceName = "Bishop";
                    break;
                case 3:
                    checkPieceName = "Rook";
                    break;
                case 4:
                    checkPieceName = "Queen";
                    break;
                case 5:
                    checkPieceName = "King";
                    break;
            }
            if (chessBoard[checkPieceName + activePlayer] & 1n << i){
                break;
            }
        }
        if (activePlayer.includes(playerId)){
            boardWeightVal += playerIdBoardWeight[checkPieceName + activePlayer][adjustedBoardWeightPos] + pieceWeight[checkPieceName];
        } else {
            boardWeightVal -= playerIdBoardWeight[checkPieceName + activePlayer][adjustedBoardWeightPos] + pieceWeight[checkPieceName];
        }
    }
    return(boardWeightVal);
}

function boardNumOfAttackWeight(chessBoard, numOfAttacks, playerId){
    let attackWeightSum = 0, otherPlayerId = getOtherPlayerId(playerId);
    for (let curPos = 0; curPos < 80; curPos++){
        let tileAttackWeight = Number(numOfAttacks[playerId][curPos] - numOfAttacks[otherPlayerId][curPos]);
        // eslint-disable-next-line no-undef
        let tileName = getBoardNameFromTileNumber(chessBoard, BigInt(curPos));
        if(tileName && !tileName.includes("King")){
            if (tileName.includes(otherPlayerId) && tileAttackWeight >= 1){
                tileAttackWeight += (pieceWeight[tileName.split("-")[0]] / 20);
            } else if (tileName.includes(playerId) && tileAttackWeight < 0){
                tileAttackWeight -= (pieceWeight[tileName.split("-")[0]] / 20);
            }
        }
        attackWeightSum += tileAttackWeight;
    }
    return(attackWeightSum);
}

function weightNextMoves(validMoves, numOfAttacks, chessBoard, playerIdBoardWeight, playerId, hashedBoardWeights, castleInPreviousPly){
    for(let curMove = 0; curMove < validMoves.length; curMove++){
        let tileName = getBoardNameFromTileNumber(chessBoard, validMoves[curMove][0]);
        let tempNumOfAttacks = getCopyOfNumOfAttacks(numOfAttacks);
        let tempChessBoard = getCopyOfChessBoard(chessBoard);
        if(typeof(hashedBoardWeights.get(validMoves[curMove][3])) === "number"){
            validMoves[curMove][2] = hashedBoardWeights.get(validMoves[curMove][3]);
            continue;
        }
        validMoves[curMove][2] = 0;
        if(tempChessBoard["King-" + playerId] & 1n << validMoves[curMove][0] && tempChessBoard["Rook-" + playerId] & 1n << validMoves[curMove][1]){
            validMoves[curMove][2] += castleBonus;
        }
        movePiece(tempChessBoard, playerId, validMoves[curMove][0], validMoves[curMove][1], tileName);
        updateAttackVals(tempChessBoard, chessBoard, tempNumOfAttacks, playerId, validMoves[curMove][0], validMoves[curMove][1]);
        validMoves[curMove][2] += boardPosWeight(tempChessBoard, playerIdBoardWeight, playerId);
        validMoves[curMove][2] += boardNumOfAttackWeight(tempChessBoard, tempNumOfAttacks, playerId);
        if(castleInPreviousPly){
            validMoves[curMove][2] += castleBonus * 2;
        }
        if(playerId === "isUser"){
            validMoves[curMove][2] *= -1;
        }
        let hashedWeight = validMoves[curMove][2];
        hashedBoardWeights.set(validMoves[curMove][3], hashedWeight);
    }
}

function mergeSortNextMoves(validMoves, playerId){
    let numOfValidMoves = validMoves.length, buildingArrayPointer = 1, arrayWorkingStorage = [[...validMoves], [...validMoves]];
    for (let mergeSize = 1; mergeSize < numOfValidMoves; mergeSize *= 2){
        let refArrayPointer = buildingArrayPointer;
        buildingArrayPointer = 1 - buildingArrayPointer;
        for (let lastMergePos = 0; lastMergePos < numOfValidMoves * 2; lastMergePos += mergeSize * 2){
            let leftPointer = lastMergePos, maxLeftPointer = lastMergePos + mergeSize;
            let rightPointer = maxLeftPointer, maxRightPointer = Math.min(numOfValidMoves, lastMergePos + mergeSize * 2);
            for(let curStoragePos = lastMergePos; curStoragePos < lastMergePos + mergeSize * 2; curStoragePos++){
                if (rightPointer < maxRightPointer && (leftPointer === maxLeftPointer || (arrayWorkingStorage[refArrayPointer][rightPointer][2] > arrayWorkingStorage[refArrayPointer][leftPointer][2] && playerId === "isAi") || 
                    (arrayWorkingStorage[refArrayPointer][rightPointer][2] < arrayWorkingStorage[refArrayPointer][leftPointer][2] && playerId === "isUser"))){  //ai = descending order; user = ascending order
                    arrayWorkingStorage[buildingArrayPointer][curStoragePos] = arrayWorkingStorage[refArrayPointer][rightPointer++];
                } else {
                    arrayWorkingStorage[buildingArrayPointer][curStoragePos] = arrayWorkingStorage[refArrayPointer][leftPointer++];
                }
                if(leftPointer === maxLeftPointer && rightPointer === numOfValidMoves){
                    break;
                }
            }
        }
    }
    validMoves["mergeSortOutput"] = [...arrayWorkingStorage[buildingArrayPointer].filter(item => item)];
}

function getGameOverWeight(chessBoard, playerId, validMoves){
    if(!validMoves.length){
        for(let i = 0n; i < 80n; i++){
            if(chessBoard["King-" + playerId] & 1n << i){
                if(isTileChecked(chessBoard, i, playerId)){
                    if(playerId == "isUser"){
                        return(100000);
                    }
                    return(-100000);
                }
            }
        }
        return(0);
    }
    return;
}

function recursiveBoardEval(chessBoard, numOfAttacks, playerId, hashedBoardWeights, randomXorNums, boardHashNum, playerIdBoardWeight, alpha, beta, castleInPreviousPly, curPlyDepth, maxPlyDepth) {
    //Generates data for current board state
    let validMoves = getAllValidMoves(chessBoard, playerId);
    let otherPlayerId = getOtherPlayerId(playerId);
    updateHashVals(chessBoard, randomXorNums, validMoves, boardHashNum, playerId);
    weightNextMoves(validMoves, numOfAttacks, chessBoard, playerIdBoardWeight, playerId, hashedBoardWeights, castleInPreviousPly);
    mergeSortNextMoves(validMoves, playerId);
    validMoves = validMoves["mergeSortOutput"];
    playerId === "isUser" ? alpha = -1000000 : beta = 1000000;
    let endGameWeight = getGameOverWeight(chessBoard, playerId, validMoves);
    if(typeof(endGameWeight) == "number"){
        return(endGameWeight);
    }
    for (let iterationNum = 0; iterationNum < validMoves.length; iterationNum++){       //Iterates through valid moves
        let oldTile = validMoves[iterationNum][0], newTile = validMoves[iterationNum][1], curBoardHashNum = validMoves[iterationNum][3];
        let removeCastleBonnus = 0, tileName = getBoardNameFromTileNumber(chessBoard, oldTile);
        if (tileName.includes("King") && (oldTile - newTile === 4 || newTile - oldTile === 3)){
            castleInPreviousPly = 1;
            removeCastleBonnus = 1;
        }
        if(++curPlyDepth <= maxPlyDepth){           //Loop for new state
            let tempNumOfAttacks = getCopyOfNumOfAttacks(numOfAttacks);
            let tempChessBoard = getCopyOfChessBoard(chessBoard), evalOutput;
            movePiece(tempChessBoard, playerId, oldTile, newTile, tileName);
            updateAttackVals(tempChessBoard, chessBoard, tempNumOfAttacks, playerId, oldTile, newTile);
            evalOutput = recursiveBoardEval(tempChessBoard, tempNumOfAttacks, otherPlayerId, hashedBoardWeights, randomXorNums, curBoardHashNum, playerIdBoardWeight, alpha, beta, castleInPreviousPly, curPlyDepth, maxPlyDepth);
            if(Array.isArray(evalOutput)){
                evalOutput = evalOutput[2];
            }
            validMoves[iterationNum][2] = evalOutput;
            hashedBoardWeights.set(curBoardHashNum, evalOutput);
            if(removeCastleBonnus){
                castleInPreviousPly = 0;
                removeCastleBonnus = 0;
            }
            if(playerId === "isUser" && evalOutput > alpha){
                alpha = evalOutput;
            } else if (playerId === "isAi" && evalOutput < beta){
                beta = evalOutput
            }
            if(alpha > beta){   //prunes branch
                break;
            }
        } else {
            break;
        }
    }
    mergeSortNextMoves(validMoves, playerId);
    validMoves = validMoves["mergeSortOutput"];
    return(validMoves[0]);
}

function buildNumOfAttacks(){
    let numOfAttacks = [], updatePos = [];
    for(let curPos = 0n; curPos < 80n; curPos++){
        updatePos[curPos] = 0n;
    }
    numOfAttacks["isAi"] = [...updatePos];
    numOfAttacks["isUser"] = updatePos;
    return(numOfAttacks);
}

export default function ChessEngine(chessBoard, hashedBoardWeights, randomXorNums) {
    let playerIdBoardWeight = getBoardWeights(chessBoard);
    let boardHashNum = generateBoardHashNum(chessBoard, randomXorNums);
    let numOfAttacks = buildNumOfAttacks();
    let bestMove, maxPlyDepth = 1, alpha = -1000000, beta = 1000000;   //alpha == ai && beta == user
    buildAttackVals(chessBoard, numOfAttacks);
    for(let startTime = new Date().getTime(); new Date().getTime() - startTime < 2000;){
        bestMove = recursiveBoardEval(chessBoard, numOfAttacks, "isAi", hashedBoardWeights, randomXorNums, boardHashNum, playerIdBoardWeight, alpha, beta, 0, 0, maxPlyDepth++);
    }
    return(bestMove);
}