/* eslint-disable eqeqeq */
/* eslint-disable no-useless-computed-key */
/* eslint-disable no-mixed-operators */
import{getBoardNameFromTileNumber} from "./engineFindMoves";

function generateRandomNumber(){
    let randomNumber = 0n;
    for(let i = 0n; i < 80n; i++){
        // eslint-disable-next-line no-undef
        randomNumber |= BigInt(Math.round((Math.random()))) << i;
    }
    return(randomNumber);
}

export function generateRandomXorNums (){
    let emptyArray = new Array(0);
    for (let i = 0; i < 80; i++){
        emptyArray[i] = 0n;
    }
    let randomXorNums = ({
        ["Pawn-isUser"] : [...emptyArray],
        ["Knight-isUser"] : [...emptyArray],
        ["Bishop-isUser"] : [...emptyArray],
        ["Rook-isUser"] : [...emptyArray],
        ["Queen-isUser"] : [...emptyArray],
        ["King-isUser"] : [...emptyArray],
        ["Pawn-isAi"] : [...emptyArray],
        ["Knight-isAi"] : [...emptyArray],
        ["Bishop-isAi"] : [...emptyArray],
        ["Rook-isAi"] : [...emptyArray],
        ["Queen-isAi"] : [...emptyArray],
        ["King-isAi"] : [...emptyArray],
        ["board"] : generateRandomNumber(),
    });
    for (let i = 0; i < 80; i++){
        randomXorNums["Pawn-isUser"][i] = generateRandomNumber();
        randomXorNums["Knight-isUser"][i] = generateRandomNumber();
        randomXorNums["Bishop-isUser"][i] = generateRandomNumber();
        randomXorNums["Rook-isUser"][i] = generateRandomNumber();
        randomXorNums["Queen-isUser"][i] = generateRandomNumber();
        randomXorNums["King-isUser"][i] = generateRandomNumber();
        randomXorNums["Pawn-isAi"][i] = generateRandomNumber();
        randomXorNums["Knight-isAi"][i] = generateRandomNumber();
        randomXorNums["Bishop-isAi"][i] = generateRandomNumber();
        randomXorNums["Rook-isAi"][i] = generateRandomNumber();
        randomXorNums["Queen-isAi"][i] = generateRandomNumber();
        randomXorNums["King-isAi"][i] = generateRandomNumber();
    }
    return(randomXorNums);
}

export function generateBoardHashNum (chessBoard, randomXorNums){
    let boardHashNum = randomXorNums["board"];
    for (let i = 1n; i < 80n; i++){
        if(!(chessBoard["overflow"] & 1n << i) && (chessBoard["isAi"] & 1n << i || chessBoard["isUser"] & 1n << i)){
            let tileName = getBoardNameFromTileNumber(chessBoard, i);
            boardHashNum ^= randomXorNums[tileName][Number(i)];
        }
    }
    return(boardHashNum);
}

export function updateHashVals(chessBoard, randomXorNums, validMoves, boardHashNum, playerId){
    for(let i = 0; i < validMoves.length; i++){
        let tileName = getBoardNameFromTileNumber(chessBoard, validMoves[i][0]);
        let delPieceName = getBoardNameFromTileNumber(chessBoard, validMoves[i][1]);
        validMoves[i][3] = boardHashNum;
        if(tileName.includes("King") && (validMoves[i][0] - validMoves[i][1] === -3 || validMoves[i][0] - validMoves[i][1] === 4)){
            let sideAdjust;
            validMoves[i][1] > validMoves[i][0] ? sideAdjust = 1 : sideAdjust = -1;
            validMoves[i][3] ^= randomXorNums[tileName][Number(validMoves[i][0])];
            validMoves[i][3] ^= randomXorNums[delPieceName][Number(validMoves[i][1])];
            validMoves[i][3] ^= randomXorNums[tileName][Number(validMoves[i][0] + 2 * sideAdjust)];
            validMoves[i][3] ^= randomXorNums[delPieceName][Number(validMoves[i][0] + 1 * sideAdjust)];
            continue;
        }
        validMoves[i][3] ^= randomXorNums[tileName][Number(validMoves[i][0])];
        if(delPieceName != 0){
            validMoves[i][3] ^= randomXorNums[delPieceName][Number(validMoves[i][1])];
        }
        validMoves[i][3] ^= randomXorNums[tileName][Number(validMoves[i][1])];
        playerId === "isAi" ? validMoves[i][3] &= ~(1n << 80n) : validMoves[i][3] |= 1n << 80n;
    }
}