let _boardModel;

//htmlElements
const _remainingFlagsStat = $("#remainingFlags")[0];
const _boardProgressStat = $("#boardProgress")[0];
const _lifesStat = $("#lifes")[0];

//player specific elements
let _lossStreakCount = 0;

let _roundStarted;



//reuse lifes in future rounds
let _originalLifeAmount = 1;
let _lifeAmount = _originalLifeAmount;
let _setFlagCount;
let _uncoveredCellsCount = 0;
let _boardView;
$(document).ready(function() {
    $("#partialBoard").load("/Game/LoadBoard", { }, onServerResponse);
    $('.resetsGame').click(function() {
        console.log("Game has been reset");
        resetGame(this);
    });

    //sets number input width to its placeholder text
    $('input').each(function () {
        this.setAttribute('size', this.getAttribute('placeholder').length);
    });
})

/**
* Will reset the game though interaction with server.
* customColumn and -Row will be defined if this function gets called from the user defined custom size option.
*/
function resetGame(sender, customColumn, customRow, customLifesCount) {
    if (_roundStarted && !isGameFinished() && !confirm("Applying new settings will also reset the current round." +
        "\nAre you sure you want to continue?")) {
        return;
    }

    var column = customColumn === undefined ? $(sender).data("column") : customColumn;
    var row = customRow === undefined ? $(sender).data("row") : customRow;

    if (!customLifesCount) {
        $("#partialBoard").load("/Game/ResetGame", { myColumn: column, myRow: row }, onServerResponse);
        return;
    }

    $("#partialBoard").load("/Game/ResetGameAndChangeLifes", { myColumn: column, myRow: row, myLifes: customLifesCount }, onServerResponse);
}

function onServerResponse(response, stat, xhr) {
    console.log("Server response was", stat);

    if (stat == "success") {
        _boardModel = JSON.parse($("#board")[0].dataset.model);

        changeTitlesOnLoss();
        refreshCellEvents();
        refreshBoardStats();
        refreshResetBtn();
    }
    else {
        console.warn("xhr:", xhr);
    }
}
function refreshBoardStats(currentBoardView) {
    if (currentBoardView) {
        console.log("boardModel has been updated to current")
        _boardModel = JSON.parse(currentBoardView.dataset.model);
    }

    refreshAfterFlagToggle(_boardModel.SetFlagCount);
    _lifesStat.textContent = `Lifes: ${_boardModel.LifeCount}`;
    _boardProgressStat.textContent = `Covered Cells: ${(_boardModel.CellCount - _boardModel.BombCount) - _boardModel.RevealedCellCount}/${_boardModel.CellCount - _boardModel.BombCount}`;
}

function refreshAfterFlagToggle(currentSetFlagCount) {
    _remainingFlagsStat.textContent = `Remaining flags: ${_boardModel.BombCount - currentSetFlagCount}/${_boardModel.BombCount}`;
}

/**
 * Highlights the neigbors of an uncovered cell by adding a classname. The uncovered cell must be hovered on.
 * Intended to help the player see the neighbors more directly, especially for chording.
 * @param {any} cellModel
 * @returns
 */
function ToggleClassOnHover(cellModel, boardViewBody) {
    //only neighbors of uncovered cells should be marked
    if (!cellModel.IsRevealed) {
        return;
    }

    //loop around cellModels neigbors
    for (let cCol = cellModel.Column - 1; cCol < cellModel.Column + 2; cCol++) {
        if (cCol < 0 || cCol > _boardModel.Columns - 1) {           //dont go out of the board
            continue;
        }

        for (let cRow = cellModel.Row - 1; cRow < cellModel.Row + 2; cRow++) {
            if (cRow < 0 || cRow > _boardModel.Rows - 1) {          //dont go out of the board
                continue;
            }

            const neighborView = boardViewBody.children[cRow].children[cCol].firstElementChild;
            const neighborModel = JSON.parse(neighborView.dataset.model);

            //ignore self, revealed cells and flagged cells since they wont be marked
            if (neighborModel === cellModel || neighborModel.IsRevealed || neighborModel.IsFlagged) {
                continue;
            }

            $(neighborView).toggleClass("hovering");
        }
    }
}

/**
 * Accepts the custom size if its valid and resets the board.
 * @returns
 */
function confirmCustomSize() {
    let customRow = $("#customRow")[0];
    let customColumn = $("#customColumn")[0];

    if (isNaN(parseInt(customRow.value)) || isNaN(parseInt(customColumn.value))) {
        alert("Please choose a value between "+ customColumn.min +" and "+ customColumn.max +".");
        return;
    }

    resetGame(this, customColumn.value, customRow.value);
}

/**
 * Changes the life amount and reset the game.
 * @returns
 */
function confirmLifeAmount() {
    let customLifes = $("#customLifes")[0];

    if (isNaN(parseInt(customLifes.value))) {
        alert("Please choose a life amount between "+ customLifes.min +" and "+ customLifes.max +".");
        return;
    }

    changeTitlesOnLoss();
    resetGame(this, _boardModel.Columns, _boardModel.Rows, customLifes.value);
}

/**
 * Changes both title and subtitle
 * @param {any} titleText
 * @param {any} subtitleText
 */
function changeTitles(titleText, subtitleText) {
    let title = document.getElementById("title");
    let subtitle = document.getElementById("subtitle");

    title.textContent = titleText;
    subtitle.textContent = subtitleText[Math.floor(Math.random() * subtitleText.length)];
}

function changeTitlesOnLoss() {
    if (_lossStreakCount == 0) {
        return;
    }

    changeTitles("Good luck!", [_lossStreakCount + 1 + (_lossStreakCount + 1 == 1 ? "st " :
        _lossStreakCount + 1 == 2 ? "nd " :
            _lossStreakCount + 1 == 3 ? "rd " : "th ") + "try's a charm"]);
}



/**
 * Gets the current board model, view and other elements after a reset.
 */
function refreshBoardElements() {
    //_boardView = document.getElementById('board');
    //_boardModel = JSON.parse(_boardView.dataset.board);
    //_boardViewBody = _boardView.firstElementChild.firstElementChild;

    //_bombCount = _boardModel.BombCount;
    //_cellCount = _boardModel.CellCount;

    //_setFlags = 0;
    //_uncoveredCells = 0;
    //_roundStarted = false;
    //_lifeAmount = _originalLifeAmount;



    //_boardView.oncontextmenu = (e) => { e.preventDefault(); }

    //_boardView.addEventListener('onCellLeftClick', e => {
    //    const { column, row } = e.detail;
    //    onCellClicked(_boardModel.Cells[column][row], _boardViewBody.children[row].cells[column].children[0]);
    //});

    //_boardView.addEventListener('onCellRightClick', e => {
    //    const { column, row } = e.detail;
    //    setFlag(_boardModel.Cells[column][row], _boardViewBody.children[row].cells[column].children[0]);
    //});

    //_boardView.addEventListener('onCellHover', e => {
    //    const { column, row } = e.detail;
    //    onCellHover(_boardModel.Cells[column][row]);
    //});

    //_boardView.addEventListener('onCellHoverEnded', e => {
    //    const { column, row } = e.detail;
    //    onCellHoverEnded(_boardModel.Cells[column][row]);
    //});
}
/**
 * Whenever the progress changes this function will update the amount of covered cells inn the UI.
 * @param {any} cellWasBomb
 */
//function changeBoardProgress(cellWasBomb) {
//    if (!cellWasBomb) {
//        _uncoveredCellsCount++;
//        _boardProgress.textContent = `Covered cells: ${(_boardModel.CellCount - _boardModel.BombCount) - _uncoveredCellsCount}/${_boardModel.CellCount - _boardModel.BombCount}`;
//    }
//}
/**
 * Will reveal the clicked cell and performs a specific action based on its attributes
*/
//function onCellClicked(cellModel, cellView) {
//    _roundStarted = true;

//    if (cellModel.IsFlagged) {
//        return;
//    }
//    else if (cellModel.IsBomb) {
//        _lifeAmount--;
//        _lifes.textContent = `Lifes: ${_lifeAmount}`;

//        //treat bomb as flag for chording
//        cellModel.IsFlagged = true;
//        cellModel.IsExploded = true;
//        cellView.onclick = () => { };
//        cellView.oncontextmenu = (e) => { e.preventDefault() };

//        if (_lifeAmount <= 0) {
//            revealBoard(false);
//            changeTitles("Game Over!", ["You lost the game!", "Better luck next time", "Stay determined!"]);
//            return;
//        }
//    }
//    // player wants to use chord
//    else if (cellModel.IsRevealed) {
//        Chord(cellModel, cellView);
//        return;
//    }

//    cellModel.IsRevealed = true;
//    cellView.textContent = cellModel.IsBomb ? "💣" : cellModel.NeighboringBombs;
//    cellView.className = cellModel.NeighboringBombs == 0 ? "empty cell" : "cell";
//    changeBoardProgress(cellModel.IsBomb);

//    if (cellModel.NeighboringBombs == 0) {
//        uncoverNeighboringCells(cellModel, cellView);
//    }

//    if (isGameFinished()) {
//        revealBoard(true);
//        changeTitles("Board Finished!", ["Awesome!", "Congrats!!", "Amazing!!!"]);
//        return;
//    }
//}

/**
 * Uncovers neighbors around the clicked cellView if the flags on the neighbors is equal/greater than its neigboring bombs
 * @param {any} cellModel
 * @param {any} cellView
 */
//function Chord(cellModel, cellView) {
//    let flaggedNeighbors = 0;
//    let neighbors = [];

//    //loop around cellModels neigbors
//    for (let cCol = cellModel.Column - 1; cCol < cellModel.Column + 2; cCol++) {
//        if (cCol < 0 || cCol > _boardColumns - 1) {           //dont go out of the board
//            continue;
//        }

//        for (let cRow = cellModel.Row - 1; cRow < cellModel.Row + 2; cRow++) {
//            if (cRow < 0 || cRow > _boardRows - 1) {          //dont go out of the board
//                continue;
//            }

//            const partialNeighbor = _boardViewBody.children[cRow].children[cCol];
//            const neighborView = partialNeighbor.firstElementChild;
//            const neighborModel = JSON.parse(neighborView.dataset.model);

//            //ignore self
//            if (cellView === neighborView) {
//                continue;
//            }

//            flaggedNeighbors = neighborView.textContent.includes("💥") || neighborView.textContent.includes("🚩") ? flaggedNeighbors + 1 : flaggedNeighbors;
//            neighbors.push({ partialCell: partialNeighbor, model: neighborModel, view: neighborView });
//        }
//    }

//    //check if theres an equal or greater amount of flags placed around it
//    if (flaggedNeighbors >= cellModel.NeighboringBombs) {
//        neighbors.forEach(obj => {
//            //ignore bombs, revealed and flagged cells
//            if (obj.view.textContent.includes(obj.model.NeighboringBombs) || obj.view.textContent.includes("🚩") || obj.view.textContent.includes("💥")) {
//                return;
//            }

//            obj.view.className = obj.model.NeighboringBombs == 0 ? "empty cell" : "cell";

//            if (obj.model.IsBomb) {
//                obj.view.textContent = "💥"
//                disableEvents(obj.partialCell);
//            }
//            else {
//                obj.view.textContent = obj.model.NeighboringBombs;
//            }

//            if (obj.model.NeighboringBombs == 0) {
//                console.log("neighbors were revealed too");
//                disableEvents(obj.partialCell);
//                uncoverNeighboringCells(obj.view, obj.model);
//            }

//            changeBoardProgress();

//            //uncover neigbors
//            //onCellClicked(index.model, index.view);
//        })
//    }
//}


/**
* Removes a classname from the neighbors of an uncovered cell whenever the hover ends.
* That way the neighbors arent highlighted anymore.
* @param {any} cellModel
* @returns
*/
//function onCellHoverEnded(cellModel) {
//    if (!cellModel.IsRevealed) {            //ignore covered cells since their neigbors wont be marked
//        return;
//    }

//    //loop around cellModels neigbors
//    for (let cCol = cellModel.Column -1; cCol < cellModel.Column + 2; cCol++) {
//        if (cCol < 0 || cCol > _boardModel.Columns -1) {           //dont go out of the board
//            continue;
//        }

//        for (let cRow = cellModel.Row - 1; cRow < cellModel.Row + 2; cRow++) {
//            if (cRow < 0 || cRow > _boardModel.Rows -1) {          //dont go out of the board
//                continue;
//            }

//            const neighborModel = _boardModel.Cells[cCol][cRow];
//            const neighborView = _boardViewBody.children[cRow].cells[cCol].children[0];

//            //ignore self, revealed cells and flagged cells since they wont be marked
//            if (neighborModel === cellModel || neighborModel.IsRevealed || neighborModel.IsFlagged) {
//                continue;
//            }

//            if (neighborView.className.includes(" hovering")) {
//                neighborView.className = neighborView.className.substring(0, neighborView.className.length - " hovering".length);
//            }
//        }
//    }
//}



/**
 * Uncovers neighbors if the current cell has no neigboring bombs, aka a 0.
 * @param {any} cellModel
 * @param {any} partialCell
 */
//function uncoverNeighboringCells(cellView, cellModel) {
//    //loop around cellView neigbors
//    for (let cCol = cellModel.Column - 1; cCol < cellModel.Column + 2; cCol++) {
//        if (cCol < 0 || cCol > _boardColumns - 1) {           //dont go out of the board
//            continue;
//        }

//        for (let cRow = cellModel.Row - 1; cRow < cellModel.Row + 2; cRow++) {
//            if (cRow < 0 || cRow > _boardRows - 1) {          //dont go out of the board
//                continue;
//            }

//            const partialNeighbor = _boardViewBody.children[cRow].children[cCol];
//            const neighborView = partialNeighbor.firstElementChild;
//            const neighborModel = JSON.parse(neighborView.dataset.model);

//            //ignore revealed cells and self
//            if (neighborView.textContent.includes(neighborModel.NeighboringBombs) || neighborView === cellView) {
//                continue;
//            }

//            neighborView.className = neighborModel.NeighboringBombs == 0 ? "empty cell" : "cell";
//            neighborView.textContent = neighborModel.NeighboringBombs;
//            changeBoardProgress();

//            //give player their flag back
//            //if (neighborModel.IsFlagged) {
//            //    _setFlags--;
//            //    neighborModel.IsFlagged = false;
//            //    _remainingFlags.textContent = `Remaining flags: ${_bombCount - _setFlags}/${_bombCount}`;
//            //}

//            //continue uncovering cells that have no bombs as neigbors!!!
//            if (neighborModel.NeighboringBombs == 0) {
//                disableEvents(partialNeighbor);
//                uncoverNeighboringCells(neighborView, neighborModel);
//            }
//        }
//    }
//}


/**
 * Iterates through the entire board to check if all non bomb cells have been revealed (game will be finished then)
 * @returns
 */
//function isGameFinished() {
//    if (_lifeAmount <= 0) {
//        return true;
//    }

//    let isFinished = true;
//    _boardModel.Cells.forEach((row) => {
//        row.forEach((cellModel) => {
//            //ignore bombs since they shouldnt be uncovered to win
//            if (cellModel.IsBomb) {
//                return;
//            }
//            isFinished = cellModel.IsRevealed ? isFinished : false;
//        });
//    });

//    return isFinished;
//}

/**
 * Reveals all bombs and disables every event for all cells.
 * Will only be called if the game is finished by winning or losing.
 * @param {any} wonGame
 */
//function revealBoard(wonGame) {
//    _boardView.className = wonGame ? _boardView.className + "won" : _boardView.className;
//    _lossStreakCount = wonGame ? 0 : _lossStreakCount + 1;

//    _boardModel.Cells.forEach((row) => {
//        row.forEach((cellModel) => {
//            const cellView = _boardViewBody.children[cellModel.Row].cells[cellModel.Column].children[0];

//            cellView.removeEventListener('click', dispatchLeftClick);
//            cellView.removeEventListener('contextmenu', dispatchRightClick);
//            cellView.removeEventListener('mouseenter', dispatchMouseEnter);
//            cellView.removeEventListener('mouseleave', dispatchMouseLeave);

//            cellView.oncontextmenu = (e) => { e.preventDefault(); };

//            //reveal all uncovered bombs
//            if (cellModel.IsExploded)
//            {
//                cellView.textContent = "💥";
//            }
//            else if (!cellModel.IsRevealed && cellModel.IsBomb) {
//                cellView.textContent = "💣";
//            }

//            if (cellView.className.includes("hovering")) {
//                cellView.className = cellView.className.substring(0, cellView.className.indexOf("hovering") - 1);
//            }

//            cellView.className = wonGame ? cellView.className + " won-game finished" : cellView.className + " finished";
//        })
//    });
//}

//function setFlag(cellModel, cellView) {
//    if (cellModel.IsRevealed) {
//        return;
//    }

//    //remove the flag
//    if (cellModel.IsFlagged) {
//        _setFlags--;
//        cellView.textContent = "";
//    }
//    //only add a flag if the amount of set flags is lesser than the amount of bombs
//    else if (_setFlags < _bombCount) {
//        _setFlags++;
//        cellView.textContent = "🚩";
//    }

//    _remainingFlags.textContent = `Remaining flags: ${_bombCount - _setFlags}/${_bombCount}`;
//}

