let _boardModel;
let _boardIsRoundFinished = false;

let _remainingFlagsStat;
let _boardProgressStat;
let _lifesStat;


$(document).ready(function () {
    console.log("document is ready");

    getPartialBoard("GetBoardView");
    $("#partialBoard").contextmenu(function(e) { e.preventDefault(); })
    $(".buttons .resetsGame").click(function() { resetGame(this); });

    $(".resetbtn").click(function () {
        let board = JSON.parse($("#board")[0].dataset.model);
        resetGame(this, board.Columns, board.Rows);
    });

    //sets number input width to its placeholder text
    $("input").each(function () {
        this.setAttribute("size", this.getAttribute("placeholder").length);
    });

    _remainingFlagsStat = $("#remainingFlags")[0];
    _boardProgressStat = $("#boardProgress")[0];
    _lifesStat = $("#lifes")[0];
})

/**
* Will reset the game though communication with server.
* If customColumn and -Row are undefined then the data will be retrieved from the sender.
* Will not change life count stat if its undefined.
*/
function resetGame(sender, customColumn, customRow, customLifesCount) {
    $.get("/Game/GetHasRoundStarted", function (hasRoundStarted, status) {
        console.log(`GetHasRoundStarted from server was ${hasRoundStarted}`);
        if (status !== "success") {
            console.warn(hasRoundStarted);
            return;
        }

        if ((hasRoundStarted && !_boardIsRoundFinished) && !confirm("Applying new settings will also reset the current round." +
            "\nAre you sure you want to continue?")) {
            return;
        }

        var column = customColumn === undefined ? $(sender).data("column") : customColumn;
        var row = customRow === undefined ? $(sender).data("row") : customRow;

        if (!customLifesCount) {
            getPartialBoard("ResetGame", column, row);
            return;
        }

        getPartialBoard("ResetGameAndChangeLifes", column, row, customLifesCount);
        console.log("Game has been reset");
    });
}


/**
 * Loads the #partialBoard element with a new Board, calls refreshCellEvents() and changeTitlesOnLoss().
 * Additional things happen if these specified parameters are defined:
 *    - column & row: resets with new custom size
 *    - customLifeCount: resets with different life count, column and row are required.
 * endPoint is required for all.
 */
function getPartialBoard(endPoint, column, row, customLifesCount) {
    $("#partialBoard").load("/Game/" + endPoint, { myColumn: column, myRow: row, myLifes: customLifesCount }, function (_, stat, xhr) {
        console.log(`${endPoint} from server was ${stat}`);

        if (stat !== "success") {
            console.warn("xhr:", xhr);
            return;
        }

        refreshCellEvents();
        refreshBoardStats($("#board")[0]);
        changeTitlesOnLoss();
    });
}

/**
 * Refreshes the current statistics shown to the player.
 */
function refreshBoardStats(currentBoard) {
    if (currentBoard.id) {
        _boardModel = JSON.parse(currentBoard.dataset.model);
    } else { _boardModel = currentBoard; }

    console.log("boardModel has been updated to current")

    refreshAfterFlagToggle(_boardModel.SetFlagCount);
    _lifesStat.textContent = `Lifes: ${_boardModel.LifeCount}`;

    let nonBombCellsCount = _boardModel.CellsCount - _boardModel.BombsCount;
    _boardProgressStat.textContent = `Covered Cells: ${nonBombCellsCount - _boardModel.RevealedCellsCount}/${nonBombCellsCount}`;
}

function refreshAfterFlagToggle(currentSetFlagCount) {
    _remainingFlagsStat.textContent = `Remaining flags: ${_boardModel.BombsCount - currentSetFlagCount}/${_boardModel.BombsCount}`;
}

/**
 * Highlights the unrevealed neighbors of a revealed cell by adding or removing a classname based on if its currently hovered on or not.
 * Intended to help the player see the neighbors more clearly for chording.
 */
function ToggleClassOnHover(cellModel, boardView, isHovering) {
    //only neighbors of revealed cells should be marked
    if (!cellModel.IsRevealed || cellModel.IsExploded) { return; }

    //loop around cellModels neighbors
    for (let col = cellModel.Column - 1; col < cellModel.Column + 2; col++) {
        if (col < 0 || col > _boardModel.Columns - 1) { continue; }         //dont go out of the board

        for (let row = cellModel.Row - 1; row < cellModel.Row + 2; row++) {
            if (row < 0 || row > _boardModel.Rows - 1) { continue; }        //dont go out of the board

            const neighborView = boardView.children[row].children[col].firstElementChild;
            const neighborModel = JSON.parse(neighborView.dataset.model);

            //ignore self, revealed cells and flagged cells since they shouldnt be marked/affected by chords
            if (neighborModel === cellModel || neighborModel.IsRevealed || neighborModel.IsFlagged) { continue; }

            if (isHovering) { $(neighborView).addClass("hovering"); }
            else { $(neighborView).removeClass("hovering"); }
        }
    }
}

/**
 * Accepts the custom size if its valid and calls resetGame with new attributes.
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
 * Accepts the custom life count if its valid and calls resetGame with the new attribute.
 */
function confirmLifeAmount() {
    let customLifes = $("#customLifes")[0];

    if (isNaN(parseInt(customLifes.value))) {
        alert("Please choose a life amount between "+ customLifes.min +" and "+ customLifes.max +".");
        return;
    }

    resetGame(this, _boardModel.Columns, _boardModel.Rows, customLifes.value);
}

/**
 * Changes both title and subtitle
 */
function changeTitles(titleText, subtitleText) {
    let title = $("#title")[0];
    let subtitle = $("#subtitle")[0];

    title.textContent = titleText;
    subtitle.textContent = subtitleText[Math.floor(Math.random() * subtitleText.length)];
}

function changeTitlesOnLoss() {
    $.get("/Game/GetLossStreakCount", function (lossStreakCount, status) {
        console.log(`LossStreakCount from server was ${status}`);
        if (status !== "success") {
            console.warn(lossStreakCount);
            return;
        }

        changeTitles("Good luck!", [lossStreakCount + 1 + (lossStreakCount + 1 == 1 ? "st " :
                                                           lossStreakCount + 1 == 2 ? "nd " :
                                                           lossStreakCount + 1 == 3 ? "rd " :
                                                                                      "th ") + "try's a charm"]);
    });
}