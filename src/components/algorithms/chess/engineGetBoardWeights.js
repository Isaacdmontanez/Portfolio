/* eslint-disable no-mixed-operators */

import {earlyGameWeights, midGameWeights, endGameWeights, defaultWeights, pieceWeight} from "./fixedBoardWeights";
import {pawnDefenceBonuses, kingPawnDefenceBonus} from "./pawnStructureWeights";

export function checkIsEarlyGame(chessBoard){
    if ((chessBoard["canCastle"] & 1n << 5n  && (chessBoard["Knight-isAi"] & 1n << 2n    || chessBoard["Bishop-isAi"] & 1n << 3n    || chessBoard["Queen-isAi"] & 1n << 4n    || chessBoard["Bishop-isAi"] & 1n << 6n    || chessBoard["Knight-isAi"] & 1n << 7n   ))&&
        (chessBoard["canCastle"] & 1n << 75n && (chessBoard["Knight-isUser"] & 1n << 72n || chessBoard["Bishop-isUser"] & 1n << 73n || chessBoard["Queen-isUser"] & 1n << 74n || chessBoard["Bishop-isUser"] & 1n << 76n || chessBoard["Knight-isUser"] & 1n << 77n))){
        return(1);
    }
    return(0);
}

function checkIsEndGame(chessBoard){
    let curBoardWeight = 0;
    for (let playerId = "empty", i = 1n; i < 80n; i++, playerId = "empty"){
        if(chessBoard["isAi"] & 1n << i){
            playerId = "isAi";
        } else if (chessBoard["isUser"] & 1n << i){
            playerId = "isUser";
        }
        if(playerId !== "empty"){
            if(chessBoard["Pawn-" + playerId] & 1n << i){
                curBoardWeight += pieceWeight["Pawn"];
            } else if(chessBoard["Knight-" + playerId] & 1n << i){
                curBoardWeight += pieceWeight["Knight"];
            } else if(chessBoard["Bishop-" + playerId] & 1n << i){
                curBoardWeight += pieceWeight["Bishop"];
            } else if(chessBoard["Rook-" + playerId] & 1n << i){
                curBoardWeight += pieceWeight["Rook"];
            } else if(chessBoard["Queen-" + playerId] & 1n << i){
                curBoardWeight += pieceWeight["Queen"];
            }
        }
    }
    if(curBoardWeight < 2500){
        return(1);
    }
}   

function getGameStageWeights(chessBoard){
    if(checkIsEarlyGame(chessBoard)){
        return(earlyGameWeights());
    }
    if (checkIsEndGame(chessBoard)){
        return(endGameWeights());
    }
    return(midGameWeights());
}

function buildPlayerIdBoardWeight(){
    let playerIdBoardWeight = [];
    let fill = [];
    for(let i = 0; i < 80; i++){
        fill[i] = 0;
    }
    playerIdBoardWeight["Pawn-isUser"] = {...fill};
    playerIdBoardWeight["Knight-isUser"] = {...fill};
    playerIdBoardWeight["Bishop-isUser"] = {...fill};
    playerIdBoardWeight["Rook-isUser"] = {...fill};
    playerIdBoardWeight["Queen-isUser"] = {...fill};
    playerIdBoardWeight["King-isUser"] = {...fill};
    playerIdBoardWeight["Pawn-isAi"] = {...fill};
    playerIdBoardWeight["Knight-isAi"] = {...fill};
    playerIdBoardWeight["Bishop-isAi"] = {...fill};
    playerIdBoardWeight["Rook-isAi"] = {...fill};
    playerIdBoardWeight["Queen-isAi"] = {...fill};
    playerIdBoardWeight["King-isAi"] = {...fill};
    return(playerIdBoardWeight);
}

export function getBoardWeights(chessBoard){
    let playerIdBoardWeight = buildPlayerIdBoardWeight();
    let defaultWeight = defaultWeights();
    let boardWeight = getGameStageWeights(chessBoard);
    for (let i = 0; i < 80; i++){
        let userPosNum = Math.floor(10 * (7 - Math.floor(i / 10)) + i % 10);
        playerIdBoardWeight["Pawn-isAi"][i] = defaultWeight["Pawn"][i] + boardWeight["Pawn"][i];
        playerIdBoardWeight["Knight-isAi"][i] = defaultWeight["Knight"][i] + boardWeight["Knight"][i];
        playerIdBoardWeight["Bishop-isAi"][i] = defaultWeight["Bishop"][i] + boardWeight["Bishop"][i];
        playerIdBoardWeight["Rook-isAi"][i] = defaultWeight["Rook"][i] + boardWeight["Rook"][i];
        playerIdBoardWeight["Queen-isAi"][i] = defaultWeight["Queen"][i] + boardWeight["Queen"][i];
        playerIdBoardWeight["Pawn-isUser"][i] = defaultWeight["Pawn"][userPosNum] + boardWeight["Pawn"][userPosNum];
        playerIdBoardWeight["Knight-isUser"][i] = defaultWeight["Knight"][userPosNum] + boardWeight["Knight"][userPosNum];
        playerIdBoardWeight["Bishop-isUser"][i] = defaultWeight["Bishop"][userPosNum] + boardWeight["Bishop"][userPosNum];
        playerIdBoardWeight["Rook-isUser"][i] = defaultWeight["Rook"][userPosNum] + boardWeight["Rook"][userPosNum];
        playerIdBoardWeight["Queen-isUser"][i] = defaultWeight["Queen"][userPosNum] + boardWeight["Queen"][userPosNum];
        if (checkIsEndGame(chessBoard)){
            playerIdBoardWeight["King-isAi"][i] = defaultWeight["King"][i] + boardWeight["King"][userPosNum];
            playerIdBoardWeight["King-isUser"][i] = defaultWeight["King"][userPosNum] + boardWeight["King"][i];
        } else {
            playerIdBoardWeight["King-isAi"][i] = defaultWeight["King"][i] + boardWeight["King"][i];
            playerIdBoardWeight["King-isUser"][i] = defaultWeight["King"][userPosNum] + boardWeight["King"][userPosNum];
        }
    }
    pawnDefenceBonuses(chessBoard, playerIdBoardWeight);
    kingPawnDefenceBonus(chessBoard, playerIdBoardWeight);
    return(playerIdBoardWeight);
}