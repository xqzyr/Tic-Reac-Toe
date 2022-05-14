import React, { useCallback, useReducer } from "react";
import ReactDOM from "react-dom";

const container = {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
};

const instruction = {
    margin: "5px 0",
    fontWeight: "bold",
    fontSize: "16px",
};

const button = {
    margin: "15px 0",
    width: "80px",
    height: "40px",
    backgroundColor: "#8acaca",
    color: "white",
    fontSize: "16px",
};

const board = {
    backgroundColor: "#eee",
    width: "208px",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    flexWrap: "wrap",
    border: "3px #eee solid",
};

const square = {
    width: "60px",
    height: "60px",
    backgroundColor: "#ddd",
    margin: "4px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "20px",
    color: "black",
};

const NextPlayer = React.memo(({ playerMark }) => (
    <div className="instruction" style={instruction}>
        Next player: {playerMark}
    </div>
));

const WinningPlayer = React.memo(({ winningPlayer }) => (
    <div className="instruction" style={instruction}>
        Winner: {winningPlayer}
    </div>
));

const Reset = React.memo(({ onClick }) => (
    <button className="button" style={button} onClick={onClick}>
        Reset
    </button>
));

const Square = React.memo(({ playerMark, squareId, onClick }) => {
    const callback = useCallback(() => onClick(squareId), [squareId, onClick]);
    return (
        <div className="square" style={square} onClick={callback}>
            {playerMark}
        </div>
    );
});

const Board = ({
    gameBoard,
    playerMark,
    winningPlayer,
    gameOver,
    onSquareClick,
    onReset,
}) => (
    <div className="container" style={container}>
        {!gameOver && <NextPlayer playerMark={playerMark} />}
        {winningPlayer && <WinningPlayer winningPlayer={winningPlayer} />}
        <Reset onClick={onReset} />
        <div className="board" style={board}>
            {gameBoard.map((playerMark, idx) => (
                <Square
                    key={idx}
                    squareId={idx}
                    playerMark={playerMark}
                    onClick={onSquareClick}
                />
            ))}
        </div>
    </div>
);

const markX = "X";
const markO = "O";
const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

const initialState = {
    gameBoard: Array(9).fill(""),
    playerMark: markX,
    winningPlayer: null,
    gameOver: false,
};

const actionTypes = {
    squareClicked: "squareClicked",
    gameReset: "gameReset",
};

const useActions = (dispatch, state) => ({
    squareClicked: (idx) =>
        dispatch({
            type: actionTypes.squareClicked,
            payload: idx,
        }),
    gameReset: () =>
        dispatch({
            type: actionTypes.gameReset,
        }),
});

export const gameReducer = (state, { type, payload }) => {
    switch (type) {
        case actionTypes.squareClicked:
            const idx = payload;
            const squareAlreadyPlayed = !!state.gameBoard[idx];
            if (state.winningPlayer || squareAlreadyPlayed) {
                return state;
            }

            const gameBoard = [...state.gameBoard];
            gameBoard[idx] = state.playerMark;

            let winningPlayer = state.winningPlayer;
            const haveWinningCombo = winningCombos.some((combo) => {
                const [idx1, idx2, idx3] = combo;
                const marks = [
                    gameBoard[idx1],
                    gameBoard[idx2],
                    gameBoard[idx3],
                ];
                const [firstMark] = marks;
                const isWinningCombo =
                    !!firstMark && marks.every((mark) => mark === firstMark);
                if (isWinningCombo) {
                    winningPlayer = firstMark;
                    return true;
                }
                return false;
            });

            const gameOver =
                haveWinningCombo || gameBoard.every((mark) => !!mark);
            const playerMark = state.playerMark === markX ? markO : markX;

            return {
                gameBoard,
                playerMark,
                winningPlayer,
                gameOver,
            };
        case actionTypes.gameReset:
            return {
                ...initialState,
            };
        default:
            throw new Error(`Unknown action ${type}`);
    }
};

const Game = () => {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const actions = useActions(dispatch, state);
    const { gameBoard, playerMark, winningPlayer, gameOver } = state;
    return (
        <div className="game">
            <div className="game-board" style={board}>
                <Board
                    gameBoard={gameBoard}
                    playerMark={playerMark}
                    winningPlayer={winningPlayer}
                    gameOver={gameOver}
                    onSquareClick={actions.squareClicked}
                    onReset={actions.gameReset}
                />
            </div>
        </div>
    );
};

ReactDOM.render(<Game />, document.getElementById("root"));
