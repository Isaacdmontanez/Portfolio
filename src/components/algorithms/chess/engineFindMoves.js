/* eslint-disable eqeqeq */
/* eslint-disable no-mixed-operators */


export function getCopyOfChessBoard(chessBoard){
    let tempChessBoard = new Array([]);
    tempChessBoard["isUser"] = chessBoard["isUser"];
    tempChessBoard["isAi"] = chessBoard["isAi"];
    tempChessBoard["overflow"] = chessBoard["overflow"];
    tempChessBoard["Pawn-isUser"] = chessBoard["Pawn-isUser"];
    tempChessBoard["Knight-isUser"] = chessBoard["Knight-isUser"];
    tempChessBoard["Bishop-isUser"] = chessBoard["Bishop-isUser"];
    tempChessBoard["Rook-isUser"] = chessBoard["Rook-isUser"];
    tempChessBoard["Queen-isUser"] = chessBoard["Queen-isUser"];
    tempChessBoard["King-isUser"] = chessBoard["King-isUser"];
    tempChessBoard["Pawn-isAi"] = chessBoard["Pawn-isAi"];
    tempChessBoard["Knight-isAi"] = chessBoard["Knight-isAi"];
    tempChessBoard["Bishop-isAi"] = chessBoard["Bishop-isAi"];
    tempChessBoard["Rook-isAi"] = chessBoard["Rook-isAi"];
    tempChessBoard["Queen-isAi"] = chessBoard["Queen-isAi"];
    tempChessBoard["King-isAi"] = chessBoard["King-isAi"];
    tempChessBoard["canCastle"] = chessBoard["canCastle"];
    tempChessBoard["enPassant"] = chessBoard["enPassant"];
    return(tempChessBoard);
}

export function getCopyOfNumOfAttacks(numOfAttacks){
    let tempNumOfAttacks = ({
        "isUser" : [...numOfAttacks["isUser"]], 
        "isAi" : [...numOfAttacks["isAi"]]
    });
    return(tempNumOfAttacks);
}

export function getOtherPlayerId(playerId){
    let otherPlayerId;
    playerId.includes("isUser") ? otherPlayerId = "isAi" : otherPlayerId = "isUser";
    return(otherPlayerId);
}


function isMoveLegal(chessBoard, oldNum, newNum){
    let playerId;
    chessBoard["isUser"] & 1n << oldNum ? playerId = "isUser" : playerId = "isAi";
    if(newNum < 80n && newNum >= 0n && newNum !== oldNum && !(chessBoard[playerId] & 1n << newNum) && !(chessBoard["overflow"] & 1n << newNum)){
        return(1);
    }
    return(0);
}

export function inverseDirection(checkDirection){
    if(checkDirection % 2){
        return(--checkDirection);
    }
    return(++checkDirection);
}

export function convertDirectionToPosition(checkDirection, tileNumber, checkDistance){
    switch(Number(checkDirection)){
        case 0:
            return(tileNumber + checkDistance * 9n);
        case 1:
            return(tileNumber + checkDistance * -9n);
        case 2:
            return(tileNumber + checkDistance * 11n);
        case 3:
            return(tileNumber + checkDistance * -11n);
        case 4:
            return(tileNumber + checkDistance * 10n);
        case 5:
            return(tileNumber - checkDistance * 10n);
        case 6:
            return(tileNumber + checkDistance);
        case 7:
            return(tileNumber - checkDistance);
        default:
    }
}

export function getBoardNameFromTileNumber(chessBoard, tileNumber){
    if(chessBoard["Pawn-isUser"] & 1n << tileNumber){
        return("Pawn-isUser");
    } else if(chessBoard["Knight-isUser"] & 1n << tileNumber){
        return("Knight-isUser");
    } else if(chessBoard["Bishop-isUser"] & 1n << tileNumber){
        return("Bishop-isUser");
    } else if(chessBoard["Rook-isUser"] & 1n << tileNumber){
        return("Rook-isUser");
    } else if(chessBoard["Queen-isUser"] & 1n << tileNumber){
        return("Queen-isUser");
    } else if(chessBoard["King-isUser"] & 1n << tileNumber){
        return("King-isUser");
    } else if(chessBoard["Pawn-isAi"] & 1n << tileNumber){
        return("Pawn-isAi");
    } else if(chessBoard["Knight-isAi"] & 1n << tileNumber){
        return("Knight-isAi");
    } else if(chessBoard["Bishop-isAi"] & 1n << tileNumber){
        return("Bishop-isAi");
    } else if(chessBoard["Rook-isAi"] & 1n << tileNumber){
        return("Rook-isAi");
    } else if(chessBoard["Queen-isAi"] & 1n << tileNumber){
        return("Queen-isAi");
    } else if(chessBoard["King-isAi"] & 1n << tileNumber){
        return("King-isAi");
    } else{
        return(0);
    }
}

export function movePiece(chessBoard, playerId, oldTile, newTile, tileName){
    (tileName.includes("Pawn") && Math.abs(Number(oldTile - newTile)) == 20) ? chessBoard["enPassant"] = 1n << newTile : chessBoard["enPassant"] = 0n;
    chessBoard["canCastle"] &= ~(1n << oldTile);
    chessBoard["canCastle"] &= ~(1n << newTile);
    if(!((tileName.includes("King") && (Math.abs(Number(oldTile - newTile)) === 3 || Math.abs(Number(oldTile - newTile)) === 4)) || tileName.includes("Castling"))){   //Normal operation
        let otherPlayerId = getOtherPlayerId(playerId);
        if(tileName.includes("Pawn") && !(chessBoard[otherPlayerId] & 1n << newTile) && Math.abs(Number(oldTile - newTile)) % 10){//En passant
            let enPassantDelPos = oldTile;
            newTile % 10n > oldTile % 10n ? enPassantDelPos++ : enPassantDelPos--;
            chessBoard[otherPlayerId] &= ~(1n << enPassantDelPos);
            chessBoard["Pawn-" + otherPlayerId] &= ~(1n << enPassantDelPos);
        }
        let delName = getBoardNameFromTileNumber(chessBoard, newTile);
        if (delName){
            chessBoard[delName] &= ~(1n << newTile);
            chessBoard[otherPlayerId] &= ~(1n << newTile);
        }
        if(tileName.includes("Pawn") && ((playerId === "isUser" && newTile < 10n) || (playerId === "isAI" && newTile > 70n))){
            chessBoard["Queen-" + playerId] |= 1n << newTile;
        } else {
            chessBoard[tileName] |= 1n << newTile;
        }
        chessBoard[tileName] &= ~(1n << oldTile);
        chessBoard[playerId] &= ~(1n << oldTile);
        chessBoard[playerId] |= 1n << newTile;
    } else {    //Castle
        let rookMove, kingMove;
        newTile % 2n ? rookMove = oldTile - 1n : rookMove = oldTile + 1n;
        newTile % 2n ? kingMove = oldTile - 2n : kingMove = oldTile + 2n;
        chessBoard["Rook-" + playerId] |= 1n << rookMove;
        chessBoard["Rook-" + playerId] &= ~(1n << newTile);
        chessBoard[playerId] &= ~(1n << newTile);
        chessBoard[playerId] &= ~(1n << oldTile)
        chessBoard[tileName] = 1n << kingMove;
        chessBoard[playerId] |= 1n << rookMove;
        chessBoard[playerId] |= 1n << kingMove;
    }
}

export function isTileChecked(chessBoard, tileNumber, playerId){
    let directionAdjustment, otherPlayerId = getOtherPlayerId(playerId);
    playerId.includes("isUser") ? directionAdjustment = -1n : directionAdjustment = 1n;
    if ((tileNumber + 9n * directionAdjustment > 0 && tileNumber + 9n * directionAdjustment < 80 && chessBoard["Pawn-" + otherPlayerId] & 1n << tileNumber + 9n * directionAdjustment) || 
        (tileNumber + 11n * directionAdjustment > 0 && tileNumber + 11n * directionAdjustment < 80 && chessBoard["Pawn-" + otherPlayerId] & 1n << tileNumber + 11n * directionAdjustment)){
        return(1);
    }
    for(let x = -2n; x < 3n; x++){
        for(let y = -2n; y < 3n; y++){
            if((x & 1n << 1n && !(x & 1n) && y & 1n) || (x & 1n && y & 1n << 1n && !(y & 1n))){
                if(chessBoard["Knight-" + otherPlayerId] & 1n << tileNumber + y * 10n + x){
                    return(1);
                }
            }
        }
    }
    for (let checkDirection = 0; checkDirection < 8; checkDirection++){
        for (let checkDistance = 1n; checkDistance < 8n; checkDistance++){
            let testPos = convertDirectionToPosition(checkDirection, tileNumber, checkDistance);
            if  (testPos > 0 && testPos < 80 && !(chessBoard["overflow"] & 1n << testPos) && ((checkDistance === 1n && chessBoard["King-" + otherPlayerId] & 1n << testPos) ||
                ((chessBoard["Bishop-" + otherPlayerId] & 1n << testPos || chessBoard["Queen-" + otherPlayerId] & 1n << testPos) && (checkDirection == 0 || checkDirection == 1 || checkDirection == 2 || checkDirection == 3)) ||
                ((chessBoard["Rook-"   + otherPlayerId] & 1n << testPos || chessBoard["Queen-" + otherPlayerId] & 1n << testPos) && (checkDirection == 4 || checkDirection == 5 || checkDirection == 6 || checkDirection == 7)))){
                return(1);
            } else if (chessBoard["isAi"] & 1n << testPos || chessBoard["isUser"] & 1n << testPos || chessBoard["overflow"] & 1n << testPos){
                break;
            }
        }
    }
    return(0);
}

function doesMoveCheckKing(chessBoard, playerId, oldTile, newTile){
    let tempChessBoard = getCopyOfChessBoard(chessBoard);
    let tileName = getBoardNameFromTileNumber(tempChessBoard, oldTile);
    movePiece(tempChessBoard, playerId, oldTile, newTile, tileName);
    for(let i = 0n; true; i++){
        if(tempChessBoard["King-" + playerId] & 1n << i){
            return(isTileChecked(tempChessBoard, i, playerId));
        }
    }
}

function tileValidMoveUpdate(chessBoard, checkdirection, tileNumber, checkDistance, continueInDirection, playerId, otherPlayerId, validTileNums){
    let testPos = convertDirectionToPosition(checkdirection, tileNumber, checkDistance);
    if(continueInDirection[checkdirection] && isMoveLegal(chessBoard, tileNumber, testPos) && !doesMoveCheckKing(chessBoard, playerId, tileNumber, testPos)){
        validTileNums.push([tileNumber, testPos]);
        if(chessBoard[otherPlayerId] & 1n << testPos){
            continueInDirection[checkdirection] = 0;
        }
    } else {
        continueInDirection[checkdirection] = 0;
    }
}

function getValidMoves(chessBoard, tileNumber){
    let directionAdjustment, testPos, validTileNums = [];
    let tileName = getBoardNameFromTileNumber(chessBoard, tileNumber);
    let playerId = tileName.split("-")[1], continueInDirection = [1,1,1,1,1,1,1,1];
    tileName = tileName.split("-")[0];
    let otherPlayerId = getOtherPlayerId(playerId);
    chessBoard["isAi"] & 1n << tileNumber ? directionAdjustment = 1n : directionAdjustment = -1n;
    switch(tileName.split("-")[0]){
        case "Pawn":
            testPos = tileNumber + 10n * directionAdjustment;
            if(testPos > 0n && testPos < 80n && !(chessBoard["isUser"] & 1n << testPos || chessBoard["isAi"] & 1n << testPos) && !doesMoveCheckKing(chessBoard, playerId, tileNumber, testPos)){    //Forward 1
                validTileNums.push([tileNumber, testPos]);
                testPos = tileNumber + 20n * directionAdjustment;
                if(((tileNumber / 10n === 1n && playerId.includes("isAi")) || (tileNumber / 10n === 6n && playerId.includes("isUser"))) && !(chessBoard["isAi"] & 1n << testPos) &&
                 !(chessBoard["isUser"] & 1n << testPos) && !doesMoveCheckKing(chessBoard, playerId, tileNumber, testPos)){    //Forward 2
                    validTileNums.push([tileNumber, testPos]);
                }
            }
            testPos = tileNumber - 1n + 10n * directionAdjustment;      
            if(isMoveLegal(chessBoard, tileNumber, testPos) && chessBoard[otherPlayerId] & 1n << testPos && !doesMoveCheckKing(chessBoard, playerId, tileNumber, testPos)){ //Diagonal left
                validTileNums.push([tileNumber, testPos]);
            } else if (isMoveLegal(chessBoard, tileNumber, testPos) && chessBoard["enPassant"] & 1n << tileNumber - 1n && !doesMoveCheckKing(chessBoard, playerId, tileNumber, testPos) && 
                !(chessBoard["isUser"] & 1n << testPos || chessBoard["isAi"] & 1n << testPos)){ //En Passant left
                validTileNums.push([tileNumber, testPos]);
            }
            testPos = tileNumber + 1n + 10n * directionAdjustment;      
            if(isMoveLegal(chessBoard, tileNumber, testPos) && chessBoard[otherPlayerId] & 1n << testPos && !doesMoveCheckKing(chessBoard, playerId, tileNumber, testPos)){   //Diagonal right
                validTileNums.push([tileNumber, testPos]);
            } else if (isMoveLegal(chessBoard, tileNumber, testPos) && chessBoard["enPassant"] & 1n << tileNumber + 1n && !doesMoveCheckKing(chessBoard, playerId, tileNumber, testPos) && 
                !(chessBoard["isUser"] & 1n << testPos || chessBoard["isAi"] & 1n << testPos)){  //En Passant right
                validTileNums.push([tileNumber, testPos]);
            }
            break;
        case "Knight":
            for(let x = -2n; x < 3n; x++){
                for(let y = -2n; y < 3n; y++){
                    if((x & 1n << 1n && !(x & 1n) && y & 1n) || (x & 1n && y & 1n << 1n && !(y & 1n))){
                        testPos = tileNumber + y * 10n + x;
                        if(isMoveLegal(chessBoard, tileNumber, testPos) && !doesMoveCheckKing(chessBoard, playerId, tileNumber, testPos)){
                            validTileNums.push([tileNumber, testPos]);
                        }
                    }
                }
            }
            break;
        case "Bishop":
            for (let checkDistance = 1n; checkDistance < 8n; checkDistance++){
                for(let checkdirection = 0; checkdirection < 4; checkdirection++){
                    tileValidMoveUpdate(chessBoard, checkdirection, tileNumber, checkDistance, continueInDirection, playerId, otherPlayerId, validTileNums);
                }
            }
            break;
        case "Rook":
            for (let checkDistance = 1n; checkDistance < 8n; checkDistance++){
                for(let checkdirection = 4; checkdirection < 8; checkdirection++){
                    tileValidMoveUpdate(chessBoard, checkdirection, tileNumber, checkDistance, continueInDirection, playerId, otherPlayerId, validTileNums);
                }
            }
            break;
        case "Queen":
            for (let checkDistance = 1n; checkDistance < 8n; checkDistance++){
                for(let checkdirection = 0; checkdirection < 8; checkdirection++){
                    tileValidMoveUpdate(chessBoard, checkdirection, tileNumber, checkDistance, continueInDirection, playerId, otherPlayerId, validTileNums);
                }
            }
            break;
        case "King":
            for(let x = -1n; x < 2n; x++){
                for(let y = -1n; y < 2n; y++){
                    testPos = tileNumber + y * 10n + x
                    if(isMoveLegal(chessBoard, tileNumber, testPos) && !doesMoveCheckKing(chessBoard, playerId, tileNumber, testPos)){
                        validTileNums.push([tileNumber, testPos]);
                    }
                }
            }
            let posAdjust, kingPos;     //Castle
            playerId.includes("isUser") ? posAdjust = 71n : posAdjust = 1n;
            playerId.includes("isAi") ? kingPos = 5n : kingPos = 75n;
            if(chessBoard[tileName + "-" + playerId] & 1n << kingPos && chessBoard["canCastle"] & 1n << 4n + posAdjust && chessBoard["canCastle"] & 1n << posAdjust && !isTileChecked(chessBoard, 2n + posAdjust, playerId) && !isTileChecked(chessBoard, 3n + posAdjust, playerId) && 
                !isTileChecked(chessBoard, 4n + posAdjust, playerId) && !(chessBoard["isAi"] & 1n << 1n + posAdjust) && !(chessBoard["isUser"] & 1n << (1n + posAdjust)) && !(chessBoard["isAi"] & 1n << (2n + posAdjust)) && 
                !(chessBoard["isUser"] & 1n << 2n + posAdjust) && !(chessBoard["isAi"] & 1n << 3n + posAdjust) && !(chessBoard["isUser"] & 1n << 3n + posAdjust) && !doesMoveCheckKing(chessBoard, playerId, tileNumber, posAdjust)){
                validTileNums.push([tileNumber, posAdjust]);
            }
            if(chessBoard[tileName + "-" + playerId] & 1n << kingPos && chessBoard["canCastle"] & 1n << 4n + posAdjust && chessBoard["canCastle"] & 1n << 7n + posAdjust && !isTileChecked(chessBoard, 4n + posAdjust, playerId) && 
                !isTileChecked(chessBoard, 5n + posAdjust, playerId) && !isTileChecked(chessBoard, 6n + posAdjust, playerId) && !(chessBoard["isAi"] & 1n << 5n + posAdjust) && 
                !(chessBoard["isUser"] & 1n << 5n + posAdjust) && !(chessBoard["isAi"] & 1n << 6n + posAdjust) && !(chessBoard["isUser"] & 1n << 6n + posAdjust) && !doesMoveCheckKing(chessBoard, playerId, tileNumber, 7n + posAdjust)){
                validTileNums.push([tileNumber, 7n + posAdjust]);
            }
            break;
        default:
    }
    return(validTileNums);
}

export function getAllValidMoves(chessBoard, playerId){
    let validMoves = [];
    for (let i = 0n; i < 80n; i++){        
        if(chessBoard[playerId] & 1n << i){
            let tempMoves = (getValidMoves(chessBoard, i));
            if(tempMoves.length){
                validMoves = validMoves.concat(tempMoves);
            }
        }
    }
    return(validMoves);
}