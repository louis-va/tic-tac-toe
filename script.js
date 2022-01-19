const Player = (name, marker) => {
    "use strict";

    let score = 0;

    const getName = () => name;
    const getMarker = () => marker;
    const getScore = () => score;
    const addPoint = () => score++;

    return { getName, getMarker, getScore, addPoint };
};

const Game = (() => {
    "use strict";

    let player1;
    let player2;
    let currentPlayer;
    let winner;
    let gameIsOver = false;
    let iaIsPlaying = false;

    let grid = [
        ["", "", ""], 
        ["", "", ""], 
        ["", "", ""]
    ];

    const _init = () => {
        player1 = Player("player", "X");
        player2 = Player("ia", "O");
        reset();
    }

    const _switchTurn = () => {
        (currentPlayer == player1) ? currentPlayer = player2 : currentPlayer = player1;
    }

    const _checkWinningCombinations = () => {
        let winningCombination = false;
        for (let i = 0; i < 3; i++) {
            if (grid[0][i] == currentPlayer.getMarker()
                && grid[1][i] == currentPlayer.getMarker()
                && grid[2][i] == currentPlayer.getMarker()
            ) winningCombination = true;

            if (grid[i][0] == currentPlayer.getMarker()
                && grid[i][1] == currentPlayer.getMarker()
                && grid[i][2] == currentPlayer.getMarker()
            ) winningCombination = true;
        }
        if (grid[0][0] == currentPlayer.getMarker()
            && grid[1][1] == currentPlayer.getMarker()
            && grid[2][2] == currentPlayer.getMarker()
        ) winningCombination = true;

        if (grid[0][2] == currentPlayer.getMarker()
            && grid[1][1] == currentPlayer.getMarker()
            && grid[2][0] == currentPlayer.getMarker()
        ) winningCombination = true;

        if (winningCombination) _endGame(false);
    }

    const _checkTied = () => {
        if(!gameIsOver) {
            if (!grid[0].includes("", 0) && !grid[1].includes("", 0) && !grid[2].includes("", 0)) {
                _endGame(true);
            }
        }
    }

    const _endOfTurn = () => {
        _checkWinningCombinations();
        _checkTied();
        _switchTurn();
        if (currentPlayer.getName() == "ia" && !gameIsOver) iaPlay();
    }

    const _endGame = (tie) => {
        if (!tie) {
            winner = currentPlayer;
            winner.addPoint();
        } else {
            winner = undefined;
        }
        gameIsOver = true;
    }

    const getGrid = () => grid;
    const getWinner = () => winner;
    const getCurrentPlayer = () => currentPlayer;
    const isOver = () => gameIsOver;

    const placeMarker = (squareRow, squareCol) => {
        if(grid[squareRow][squareCol] == "" && !gameIsOver ) {
            grid[squareRow][squareCol] = currentPlayer.getMarker();
            _endOfTurn();
        }
    }

    const reset = () => {
        grid = [
            ["", "", ""], 
            ["", "", ""], 
            ["", "", ""]
        ];
        currentPlayer = (Math.floor(Math.random() * 2) == 0) ? player1 : player2; // choose a player randomly
        gameIsOver = false;
    }

    const iaPlay = () => {
        let squareIsEmpty = false;
        let row, column;
        while (!squareIsEmpty) {
            row = Math.floor(Math.random() * 3);
            column = Math.floor(Math.random() * 3);
            squareIsEmpty = (grid[row][column] == "") ? true : false;
        }
        placeMarker(row, column);
    }

    _init();

    return { getGrid, getWinner, getCurrentPlayer, isOver, placeMarker, reset, iaPlay };
})();

const DisplayController = (() => {
    "use strict";

    const _init = () => {
        _setButtonEvents();
        _updateDisplay();
        _displayText(`>> New game. [${Game.getCurrentPlayer().getName()}] starts.`)
    }

    const _updateDisplay = () => {
        _displayMarkersOnGrid();

        if (Game.isOver()) {
            _disableButtons();
            _updateScore();
            replayButton.classList.toggle("hidden");
            if (Game.getWinner()) {
                _displayText(`>> The game is over. [${Game.getWinner().getName()}] won!`);
            } else {
                _displayText(`>> The game is over. It's a tie!`);
            }
        }
    }

    const _displayMarkersOnGrid = () => {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                squares[row][col].textContent = Game.getGrid()[row][col];
                if(squares[row][col].textContent != "") squares[row][col].disabled = true;
            }
        }
    }

    const _setButtonEvents = () => {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                squares[row][col].addEventListener("click", (e) => {
                    _clickOnSquare(row, col);
                });
            }
        }
    }

    const _disableButtons = () => {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                squares[row][col].disabled = true;
            }
        }
    }

    const _clickOnSquare = (row, col) => {
        Game.placeMarker(row, col);
        _updateDisplay();
    }

    const _updateScore = () => {
        if (Game.getWinner()) {
            let winnerSelector = "#" + Game.getWinner().getName() + ">.score";
            let winnerScore = Game.getWinner().getScore();
            document.querySelector(winnerSelector).textContent = winnerScore;
        }
    }

    const _reset = () => {
        Game.reset();
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                squares[row][col].disabled = false;
            }
        }
        replayButton.classList.toggle("hidden");
        _displayText(`>> New game. [${Game.getCurrentPlayer().getName()}] starts.`)
        if (Game.getCurrentPlayer().getName() == "ia") Game.iaPlay();
        _updateDisplay();
    }

    const _displayText = (text) => {
        feedback.textContent = "";
        const textArray = text.split("");

        clearTimeout(timerID); // clear timout out in case the previous text was still being written

        // writes text letter by letter with a 60ms delay
        function typewriter(index) {
            if (index < textArray.length) {
                feedback.textContent = feedback.textContent + textArray[index];
                timerID = setTimeout(() => typewriter(index + 1), 60);
            }
        }
        typewriter(0);

    }

    const squares = [
        [document.getElementById("sq_1_1"), document.getElementById("sq_1_2"), document.getElementById("sq_1_3")], 
        [document.getElementById("sq_2_1"), document.getElementById("sq_2_2"), document.getElementById("sq_2_3")], 
        [document.getElementById("sq_3_1"), document.getElementById("sq_3_2"), document.getElementById("sq_3_3")]
    ];

    let timerID;
    const replayButton = document.getElementById("replay_btn");
    const feedback = document.getElementById("feedback");

    replayButton.addEventListener("click", _reset);

    _init();

    return {  }
})();