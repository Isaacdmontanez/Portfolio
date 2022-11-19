/* eslint-disable eqeqeq */
/* eslint-disable no-mixed-operators */
import { convertDirectionToPosition, inverseDirection, getBoardNameFromTileNumber, getOtherPlayerId } from "./engineFindMoves";

function updatePawnNumOfAttacks(chessBoard, numOfAttacks, tileNumber, modifyByThisVal, playerId){
    for(let checkDirection = 0; checkDirection < 4; checkDirection += 2){
        let totalAttacks = 0n;
        if (!checkDirection && playerId === "isAi"){
            checkDirection++;
        }
        for (let checkDistance = 1n; checkDistance < 8n; checkDistance++){
            let updatePos = convertDirectionToPosition(checkDirection, tileNumber, checkDistance);
            if (updatePos < 1n || updatePos > 79n || chessBoard["overflow"] & 1n << updatePos){
                break;
            }
            if(chessBoard["Queen-" + playerId] & 1n << updatePos || chessBoard["Bishop-" + playerId] & 1n << updatePos){
                totalAttacks += modifyByThisVal;
            } else if (chessBoard["isUser"] & 1n << updatePos || chessBoard["isAi"] & 1n << updatePos){
                break;
            }
        }
        let updatePos = convertDirectionToPosition(inverseDirection(checkDirection), tileNumber, 1n);
        if(!(updatePos < 1n || updatePos > 79n || chessBoard["overflow"] & 1n << updatePos)){
            numOfAttacks[playerId][Number(updatePos)] += totalAttacks;
        }
    }
}

function updateNumOfAttacks(chessBoard, numOfAttacks, checkDirection, tileNumber, modifyByThisVal, playerId, adjustingLineOfSight){
    let updatePos, otherPlayerId = getOtherPlayerId(playerId);
    // eslint-disable-next-line no-undef
    tileNumber = BigInt(tileNumber);
    for(let checkDistance = 1n; checkDistance < 8n; checkDistance++){
        updatePos = convertDirectionToPosition(checkDirection, tileNumber, checkDistance);
        if (updatePos < 1n || updatePos > 79n || chessBoard["overflow"] & 1n << updatePos){
            return;
        }
        numOfAttacks[playerId][Number(updatePos)] += modifyByThisVal;
        if  (chessBoard[otherPlayerId] & 1n << updatePos || (chessBoard[playerId] & 1n << updatePos && 
            !(chessBoard["Queen-" + playerId] & 1n << updatePos ||
            (chessBoard["Bishop-" + playerId] & 1n << updatePos && checkDirection < 4) || 
            (chessBoard["Rook-"   + playerId] & 1n << updatePos && checkDirection >= 4)))){
            let pawnDirectionAdjust;
            playerId === "isUser" ? pawnDirectionAdjust = 1 : pawnDirectionAdjust = 0;
            if(adjustingLineOfSight && chessBoard["Pawn-" + playerId] & 1n << updatePos && (checkDirection == pawnDirectionAdjust || checkDirection == pawnDirectionAdjust + 2)){
                updatePos = convertDirectionToPosition(checkDirection, tileNumber, checkDistance + 1n);
                if (!(updatePos < 1n || updatePos > 79n || chessBoard["overflow"] & 1n << updatePos)){
                    numOfAttacks[playerId][Number(updatePos)] += modifyByThisVal;
                }
            }
            return;
        }
    }
}

function adjustLineOfSight(chessBoard, numOfAttacks, tileNumber, modifyByThisVal){
    for(let playerId = "isUser", otherPlayerId = "isAi", checkBothPlayers = 0; checkBothPlayers !== 2; checkBothPlayers++, playerId = "isAi", otherPlayerId = "isUser"){
        for (let checkDirection = 0; checkDirection < 8; checkDirection++){
            let totalAttacks = 0n;
            for(let checkDistance = 1n; checkDistance < 8n; checkDistance++){
                let curPos = convertDirectionToPosition(checkDirection, tileNumber, checkDistance);
                if (curPos < 1n || curPos > 79n || chessBoard["overflow"] & 1n << curPos || chessBoard[otherPlayerId] & 1n << curPos){
                    break;
                }
                if (chessBoard["Queen-" + playerId] & 1n << curPos || (chessBoard["Bishop-" + playerId] & 1n << curPos && checkDirection < 4) || (chessBoard["Rook-" + playerId] & 1n << curPos && checkDirection >= 4)){
                    if(!(chessBoard["Queen-" + playerId] & 1n << tileNumber || (chessBoard["Bishop-" + playerId] & 1n << tileNumber && checkDirection < 4) || (chessBoard["Rook-" + playerId] & 1n << tileNumber && checkDirection >= 4))){
                        totalAttacks += modifyByThisVal;
                    }                    
                } else if (chessBoard[playerId] & 1n << curPos){
                    break;
                }
            }
            if (totalAttacks){
                updateNumOfAttacks(chessBoard, numOfAttacks, inverseDirection(checkDirection), tileNumber, totalAttacks, playerId, 1);
            }
        }
    }
}

function updateVals(chessBoard, numOfAttacks, tileNumber, tileName, playerId, modifyByThisVal){
    let updatePos = 0n;
    if (tileName.includes("Queen") || tileName.includes("Bishop")){
        for (let checkDirection = 0; checkDirection < 4; checkDirection++){
            updateNumOfAttacks(chessBoard, numOfAttacks, checkDirection, tileNumber, modifyByThisVal, playerId, 0);
        }
    }
    if (tileName.includes("Queen") || tileName.includes("Rook")){
        for (let checkDirection = 4; checkDirection < 8; checkDirection++){
            updateNumOfAttacks(chessBoard, numOfAttacks, checkDirection, tileNumber, modifyByThisVal, playerId, 0);
        }
    }
    if (tileName.includes("Pawn")){
        updatePawnNumOfAttacks(chessBoard, numOfAttacks, tileNumber, modifyByThisVal, playerId);
        chessBoard["isAi"] & 1n << tileNumber ? updatePos = tileNumber + 9n : updatePos = tileNumber - 9n;
        if(updatePos < 80n && updatePos > 0n && !(chessBoard["overflow"] & 1n << updatePos)){
            numOfAttacks[playerId][Number(updatePos)] += modifyByThisVal;
        }
        chessBoard["isAi"] & 1n << tileNumber ? updatePos = tileNumber + 11n : updatePos = tileNumber - 11n;
        if(updatePos < 80n && updatePos > 0n && !(chessBoard["overflow"] & 1n << updatePos)){
            numOfAttacks[playerId][Number(updatePos)] += modifyByThisVal;
        }
    }
    if (tileName.includes("King")){
        for(let checkXPos = -1n; checkXPos < 2n; checkXPos++){
            for(let checkYPos = -1n; checkYPos < 2n; checkYPos++){
                updatePos = tileNumber + checkXPos + checkYPos * 10n;
                if(updatePos > 0n && updatePos < 80n && !(chessBoard["overflow"] & 1n << updatePos) && updatePos !== tileNumber){
                    numOfAttacks[playerId][Number(updatePos)] += modifyByThisVal;
                }
            }
        }
    }
    if (tileName.includes("Knight")){
        for (let checkXPos = -2n; checkXPos < 3n; checkXPos++){
            for (let checkYPos = -2n; checkYPos < 3n; checkYPos++){
                updatePos = tileNumber + checkXPos + checkYPos * 10n;
                if(((Math.abs(Number(checkXPos)) === 2 && Math.abs(Number(checkYPos)) === 1) || (Math.abs(Number(checkYPos)) === 2 && Math.abs(Number(checkXPos)) === 1)) && 
                    updatePos > 0n && updatePos < 80n && !(chessBoard["overflow"] & 1n << updatePos)){
                    numOfAttacks[playerId][Number(updatePos)] += modifyByThisVal;
                }
            }
        }
    }
}

export function updateAttackVals(newChessBoard, oldChessBoard, numOfAttacks, playerId, oldTile, newTile){
    let pieceOnOldTile = getBoardNameFromTileNumber(oldChessBoard, oldTile), pieceOnNewTile = getBoardNameFromTileNumber(oldChessBoard, newTile);
    let otherPlayerId = getOtherPlayerId(playerId)
    adjustLineOfSight(oldChessBoard, numOfAttacks, oldTile, 1n);
    adjustLineOfSight(newChessBoard, numOfAttacks, newTile, -1n);
    if(pieceOnOldTile === "King-" + playerId && pieceOnNewTile === "Rook-" + playerId){
        let newKingPos, newRookPos;
        oldTile > newTile ? newKingPos = oldTile - 2n : newKingPos = oldTile + 2n;
        oldTile > newTile ? newRookPos = oldTile - 1n : newRookPos = oldTile + 1n;
        updateVals(oldChessBoard, numOfAttacks, oldTile,    pieceOnOldTile, playerId, -1n);
        updateVals(oldChessBoard, numOfAttacks, newTile,    pieceOnNewTile, playerId, -1n);
        updateVals(newChessBoard, numOfAttacks, newKingPos, pieceOnOldTile, playerId, 1n);
        updateVals(newChessBoard, numOfAttacks, newRookPos, pieceOnNewTile, playerId, 1n);
        return;
    }
    updateVals(oldChessBoard, numOfAttacks, oldTile, pieceOnOldTile, playerId, -1n);
    pieceOnOldTile = getBoardNameFromTileNumber(newChessBoard, newTile);        //Needed for pawn promotions
    updateVals(newChessBoard, numOfAttacks, newTile, pieceOnOldTile, playerId, 1n);
    if(pieceOnNewTile){
        updateVals(oldChessBoard, numOfAttacks, newTile, pieceOnNewTile, otherPlayerId, -1n);
    }
}

export function buildAttackVals(chessBoard, numOfAttacks){
    for(let checkTileNumber = 1n; checkTileNumber < 80n; checkTileNumber++){
        if(chessBoard["isAi"] & 1n << checkTileNumber){
            updateVals(chessBoard, numOfAttacks, checkTileNumber, getBoardNameFromTileNumber(chessBoard, checkTileNumber), "isAi", 1n);
        } else if(chessBoard["isUser"] & 1n << checkTileNumber){
            updateVals(chessBoard, numOfAttacks, checkTileNumber, getBoardNameFromTileNumber(chessBoard, checkTileNumber), "isUser", 1n);
        }
    }
}