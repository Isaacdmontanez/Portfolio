/* eslint-disable no-mixed-operators */
import { checkIsEarlyGame } from "./engineGetBoardWeights";
function pawnAdjacencyBonus(chessBoard, playerIdBoardWeight, playerId, playerIdWeightAdjust){
    for(let curPos = 1n; curPos < 80n; curPos++){
        if(chessBoard["Pawn-" + playerId] & 1n << curPos){
            let curPosNum = Number(curPos);
            if(curPosNum % 10 > 1){    //Left Adjacency Bonus
                playerIdBoardWeight["Pawn-" + playerId][curPosNum - 1] += playerIdWeightAdjust * 10;
                if(curPosNum < 70){
                    playerIdBoardWeight["Pawn-" + playerId][curPosNum + 9] += playerIdWeightAdjust * 10;
                }
                if(curPosNum > 10){
                    playerIdBoardWeight["Pawn-" + playerId][curPosNum - 11] += playerIdWeightAdjust * 10;
                }
            }
            if(curPosNum % 10 < 8){     //Right Adjacency Bonus
                playerIdBoardWeight["Pawn-" + playerId][curPosNum + 1] += playerIdWeightAdjust * 10;
                if(curPosNum < 70){
                    playerIdBoardWeight["Pawn-" + playerId][curPosNum - 9] += playerIdWeightAdjust * 10;
                }
                if(curPosNum > 10){
                    playerIdBoardWeight["Pawn-" + playerId][curPosNum + 11] += playerIdWeightAdjust * 10;
                }
            }
            for(let checkDoublePawnPos = curPos % 10n; checkDoublePawnPos < 80n; checkDoublePawnPos += 10n){    //Discourages double pawns
                if(checkDoublePawnPos === curPos){
                    continue;
                }
                if(chessBoard["Pawn-" + playerId] & 1n << checkDoublePawnPos){
                    for(let badPawnColumnPos = curPosNum % 10; badPawnColumnPos < 80; badPawnColumnPos += 10){
                        playerIdBoardWeight["Pawn-" + playerId][badPawnColumnPos] -= playerIdWeightAdjust * 5;
                    }
                }
            }
            for(let disourageDoublePawns = curPosNum % 10; disourageDoublePawns < 80; disourageDoublePawns += 10){
                playerIdBoardWeight["Pawn-" + playerId][disourageDoublePawns] -= playerIdWeightAdjust * 5;
            }
        }
    }
}

function kingPawnsDefense(chessBoard, playerIdBoardWeight, playerIdWeightAdjust){
    let kingPos, playerId, userKingPos = 1n, aiKingPos = 1n, canCastle;
    for(; !(chessBoard["King-isAi"] & 1n << aiKingPos); aiKingPos++);
    for(; !(chessBoard["King-isUser"] & 1n << userKingPos); userKingPos++);
    for(let playerIdLoop = -1; playerIdLoop !== 3; playerIdLoop += 2){
        if(playerIdLoop === -1){
            playerId = "isUser";
            canCastle = chessBoard["canCastle"] & 1n << userKingPos;
            kingPos = Number(userKingPos);
            if(kingPos > 70 && kingPos < 74){
                playerIdBoardWeight["Pawn-" + playerId][51] += playerIdWeightAdjust * 40;
            } else if(kingPos > 75){
                playerIdBoardWeight["Pawn-" + playerId][58] += playerIdWeightAdjust * 40;
            }
        } else {
            playerId = "isAi";
            canCastle = chessBoard["canCastle"] & 1n << aiKingPos;
            kingPos = Number(aiKingPos);
            if(kingPos < 4){
                playerIdBoardWeight["Pawn-" + playerId][21] += playerIdWeightAdjust * 40;
            } else if(kingPos > 5 && kingPos < 9){
                playerIdBoardWeight["Pawn-" + playerId][28] += playerIdWeightAdjust * 40;
            }
        }
        if(kingPos % 10 !== 4 && kingPos % 10 !== 5){
            if(kingPos % 10 > 1){
                playerIdBoardWeight["Pawn-" + playerId][kingPos - 1] += playerIdWeightAdjust * 40;
            }
            if(kingPos % 10 < 8){
                playerIdBoardWeight["Pawn-" + playerId][kingPos + 1] += playerIdWeightAdjust * 40;
            }
            if(!(Math.floor(kingPos / 10) === 7 && playerIdLoop === 1) && !(!Math.floor(kingPos / 10) && playerIdLoop === -1)){
                if(kingPos % 10 > 1){
                    playerIdBoardWeight["Pawn-" + playerId][kingPos + 11 * playerIdLoop] += playerIdWeightAdjust * 40;
                }
                if(kingPos % 10 < 8){
                    playerIdBoardWeight["Pawn-" + playerId][kingPos + 9 * playerIdLoop] += playerIdWeightAdjust * 40;
                }
                playerIdBoardWeight["Pawn-" + playerId][kingPos + 10 * playerIdLoop] += playerIdWeightAdjust * 40;
            }
        } else if (canCastle){
            let sideAdjust;
            playerId === "isUser" ? sideAdjust = 60 : sideAdjust = 10;
            for(let xPos = 1; xPos < 9; xPos++){
                if(!(xPos === 4 || xPos === 5)){
                    playerIdBoardWeight["Pawn-" + playerId][sideAdjust + xPos] += playerIdWeightAdjust * 15;
                    if(xPos === 1 || xPos === 8){
                        playerIdBoardWeight["Pawn-" + playerId][10 * playerIdLoop + sideAdjust + xPos] += playerIdWeightAdjust * 5;
                    }   
                }
            }
        }
    }
}

export function pawnDefenceBonuses(chessBoard, playerIdBoardWeight){
    let playerIdWeightAdjust = 1;
    //playerIdWeightAdjust === 1 ? playerIdWeightAdjust = -0.2 : playerIdWeightAdjust = 1;  //Reserved for future updates.
    kingPawnsDefense(chessBoard, playerIdBoardWeight, playerIdWeightAdjust);
    pawnAdjacencyBonus(chessBoard, playerIdBoardWeight, "isAi", playerIdWeightAdjust);
    pawnAdjacencyBonus(chessBoard, playerIdBoardWeight, "isUser", playerIdWeightAdjust);
}

export function kingPawnDefenceBonus(chessBoard, playerIdBoardWeight){
    if (checkIsEarlyGame(chessBoard)){
        return;
    }
    if(chessBoard["King-isAi"] & 1n << 1n || chessBoard["King-isAi"] & 1n << 2n || chessBoard["King-isAi"] & 1n << 3n){
        playerIdBoardWeight["Pawn-isAi"][11] += 25;
        playerIdBoardWeight["Pawn-isAi"][12] += 25;
        playerIdBoardWeight["Pawn-isAi"][13] += 25;
    } else if (chessBoard["King-isAi"] & 1n << 6n || chessBoard["King-isAi"] & 1n << 7n || chessBoard["King-isAi"] & 1n << 8n){
        playerIdBoardWeight["Pawn-isAi"][16] += 25;
        playerIdBoardWeight["Pawn-isAi"][17] += 25;
        playerIdBoardWeight["Pawn-isAi"][18] += 25;
    }
    if(chessBoard["King-isUser"] & 1n << 71n || chessBoard["King-isUser"] & 1n << 72n || chessBoard["King-isUser"] & 1n << 73n){
        playerIdBoardWeight["Pawn-isUser"][61] += 25;
        playerIdBoardWeight["Pawn-isUser"][62] += 25;
        playerIdBoardWeight["Pawn-isUser"][63] += 25;
    } else if (chessBoard["King-isUser"] & 1n << 76n || chessBoard["King-isUser"] & 1n << 77n || chessBoard["King-isUser"] & 1n << 78n){
        playerIdBoardWeight["Pawn-isUser"][66] += 25;
        playerIdBoardWeight["Pawn-isUser"][67] += 25;
        playerIdBoardWeight["Pawn-isUser"][68] += 25;
    }
}