let _boardModel;
let _remainingFlagsStat = $("#remainingFlags")[0];
let _boardProgressStat = $("#boardProgress")[0];
let _lifesStat = $("#lifes")[0];


let _lossStreakCount = 0;
let _roundStarted;

$(document).ready(function() {
    getPartialBoard("GetBoard");
    $('#partialBoard').contextmenu((e) => { e.preventDefault(); })
    $('.buttons .resetsGame').click(function() {
        resetGame(this);
    });

    $('.resetsGame.resetbtn').click(function () {
        let board = JSON.parse($("#board")[0].dataset.model);
        resetGame(this, board.Columns, board.Rows);
    });

    //sets number input width to its placeholder text
    $('input').each(function () {
        this.setAttribute('size', this.getAttribute('placeholder').length);
    });

    _remainingFlagsStat = $("#remainingFlags")[0];
    _boardProgressStat = $("#boardProgress")[0];
    _lifesStat = $("#lifes")[0];
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

    console.log("Game has been reset");
    var column = customColumn === undefined ? $(sender).data("column") : customColumn;
    var row = customRow === undefined ? $(sender).data("row") : customRow;

    if (!customLifesCount) {
        getPartialBoard("ResetGame", column, row);
        return;
    }

    getPartialBoard("ResetGameAndChangeLifes", column, row, customLifesCount);
}

function getPartialBoard(endPoint, column, row, customLifesCount) {
    $("#partialBoard").load("/Game/" + endPoint, { myColumn: column, myRow: row, myLifes: customLifesCount }, function (response, stat, xhr) {
        console.log("Server response was", stat);

        if (stat !== "success") {
            console.warn("xhr:", xhr);
            return;
        }
        _boardModel = JSON.parse($("#board")[0].dataset.model);

        changeTitlesOnLoss();
        refreshCellEvents();
        refreshBoardStats();
    });
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
function ToggleClassOnHover(cellModel, boardView, isHovering) {
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

            const neighborView = boardView.children[cRow].children[cCol].firstElementChild;
            const neighborModel = JSON.parse(neighborView.dataset.model);

            //ignore self, revealed cells and flagged cells since they wont be marked
            if (neighborModel === cellModel || neighborModel.IsRevealed || neighborModel.IsFlagged) {
                continue;
            }

            if (isHovering) {
                $(neighborView).addClass("hovering");
            }
            else {
                $(neighborView).removeClass("hovering");
            }
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