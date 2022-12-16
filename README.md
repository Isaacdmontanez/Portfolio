I built this website using Javascript, React, and CSS without APIs, outside code, or help. It includes a single-player Chess game, a graphing algorithm visualizer, and a sorting algorithm visualizer. For an in-depth explanation of each project, please view the documentation at https://isaacdmontanez.github.io/portfolio or in src\components\text. <br/>

## Chess:<br />

#### Chessboard:<br />

This section covers the user interface on the Chess tab. The Chessboard and Chess engine work independently to avoid bugs during future development. This section will cover state changes, the board, the past move dashboard, the killed piece display, and the game strength display (slider on the right). <br />

State changes can occur when the player moves a piece, upgrades a pawn, changes the game state to a previous state (and confirms/denies the state change on the popup), clicks undo, or starts a new game. <br />

The board displays the current game state and allows the user to move pieces. After the player moves a piece, the board checks if the move is legal, checks if the move causes a Pawn promotion, checks if the game is over, updates the past move dashboard, updates the killed piece display, and calls the chess engine. The Pawn promotion pauses the game until the user makes a selection. The end-game modal stops the user from making moves on the board. <br />

The past move dashboard displays past moves and allows the user to change the board state to any previous state. The data used here updates when the board state changes. The board state will temporarily change when the user hovers over a previous state. The board state permanently changes with the undo button, new game button, or after the user clicks a previous move and confirms the change on the popup modal. The dashboard will call the engine if the state changes to the Ai's turn.<br />

The killed piece display counts the number of active pieces on the board and displays the missing pieces. <br />

The game strength display is the current strength of the game returned by the engine. <br />

#### Chess Engine:<br />

The engine uses a minimax algorithm with iterative deepening and alpha-beta pruning. In order words, the engine will start at a depth of one and reevaluate one depth deeper until it runs out of time. The engine restarts the evaluation after each ply (additional depth) and uses the calculations from the previous ply to order the next iteration. When evaluating each ply, the engine assumes each player will act logically. Therefore the engine can prune (exclude) everything except the best moves for each player. A best-case ordered ply evaluates the square root of the worst-case ordered ply's amount of board states. <br />

The engine calculates the weight of each board by the position of each piece, the pieces on the board, and a portion of the value of each piece that can be captured.<br />

Zobrist Hashing stores and retrieves the weight of each evaluated board state. <br />

I use Bitboards and bit operations to increase the speed of the engine. Bitboards use a 10x8 board represented as an 80-bit Bigint for easy evaluation.<br />

## Graphing Visualizer:<br />

The graphing visualizer allows the user to build and use five different graphing algorithms. When an algorithm is activated, it runs whenever the graph changes. To use a larger or smaller graph, zoom out or in and refresh the page.<br />

## Sorting Visualizer:<br />

The sorting visualizer automatically generates random displays and requires users to select the algorithm they want to run.<br />

I use timeouts to visualize updates; however, timeouts have a minimum delay of 4 ms. Timeouts are called at the start to reduce the delay to 1 ms. The delay for timeouts starts at 4 ms and increases by a predetermined amount after each previously called timeout.<br />

The changes made represent state changes and are not reflective of time complexity.<br />
