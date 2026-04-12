let _lifesStat;
let _boardModel;
let _boardProgressStat;
let _remainingFlagsStat;


$(() => {
    console.log("document is ready");

    getPartialBoard("GetBoardView");
    document.getElementById("partialBoard").oncontextmenu = function(e) { e.preventDefault(); };
    document.getElementsByClassName(".buttons.resetsGame").onclick = function () { resetRound(this) };

    $(".resetbtn").click(function () {
        let board = JSON.parse($("#board")[0].dataset.model);
        resetRound(this, board.Columns, board.Rows);
    });


    let customizable = $(".customizable")[0];
    $(customizable).hide();

    $(".customizable-btn").click(function () {
        let custombtn = this;

        if (!customizable.checkVisibility()) {           //change the direction in custombtn based on if settings is shown or not
            custombtn.innerHTML = `\<<br>\<`;
        }
        else {
            custombtn.innerHTML = `\><br>\>`;
        }
        $(customizable).toggle("slow", "swing");
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
function resetRound(sender, customColumn, customRow, customLifesCount) {
    $.get("/Game/GetCurrentState", function (currentState, status) {
        console.log(`GetCurrentState from server was ${status}`);
        if (status !== "success") {
            console.warn(currentState);
            return;
        }

        if ((currentState == STATE_ACTIVE) && !confirm("Applying new settings will also reset the current round." +
            "\nAre you sure you want to continue?")) {
            return;
        }

        var column = customColumn === undefined ? $(sender).data("column") : customColumn;
        var row = customRow === undefined ? $(sender).data("row") : customRow;

        if (!customLifesCount) {
            getPartialBoard("ResetRound", column, row);
            return;
        }

        getPartialBoard("ResetRoundAndSetLifes", column, row, customLifesCount);
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
    _lifesStat.innerHTML = `<b>Lifes:</b><br>${_boardModel.LifeCount}`;

    let nonBombCellsCount = _boardModel.CellsCount - _boardModel.BombsCount;
    _boardProgressStat.innerHTML = `<b>Covered Cells:</b><br>${nonBombCellsCount - _boardModel.RevealedCellsCount}/${nonBombCellsCount}`;
}

function refreshAfterFlagToggle(currentSetFlagCount) {
    _remainingFlagsStat.innerHTML = `<b>Remaining flags:</b><br>${_boardModel.BombsCount - currentSetFlagCount}/${_boardModel.BombsCount}`;
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
 * Accepts the custom size if its valid and calls resetRound with new attributes.
 */
function confirmCustomSize() {
    let customRow = $("#customRow")[0];
    let customCol = $("#customColumn")[0];

    let customColValue = parseInt(customCol.value);
    let customRowValue = parseInt(customRow.value);

    if (isNaN(customColValue) || customCol.min > customColValue || customCol.max < customColValue ||
        isNaN(customRowValue) || customRow.min > customRowValue || customRow.max < customRowValue) {
        alert("Please choose a value between "+ customCol.min +" and "+ customCol.max +".");
        return;
    }

    resetRound(this, customColValue, customRowValue);
}

/**
 * Accepts the custom life count if its valid and calls resetRound with the new attribute.
 */
function confirmLifeAmount() {
    let customLifes = $("#customLifes")[0];
    let customLifesValue = parseInt(customLifes.value);

    if (isNaN(customLifesValue) || customLifes.min > customLifesValue || customLifes.max < customLifesValue) {
        alert("Please choose a life amount between "+ customLifes.min +" and "+ customLifes.max +".");
        return;
    }

    resetRound(this, _boardModel.Columns, _boardModel.Rows, customLifesValue);
}

/**
 * Changes both title and subtitle
 */
function changeTitles(titleText, subtitleText, lossStreakCount) {
    let title = $("#title")[0];
    let subtitle = $("#subtitle")[0];
    let previousSubtitle = subtitle.textContent;

    title.textContent = titleText;
    let chosenSubtitle = subtitleText[Math.floor(Math.random() * subtitleText.length)];
    subtitle.textContent = chosenSubtitle;

    //check if the secret wasnt chosen
    if (chosenSubtitle != subtitleText[99]) {
        subtitle.style.textShadow = "";
        return;
    }

    //if we get the secret, then make it rainbow!!
    let text = subtitle.innerText;
    subtitle.innerHTML = "";

    for (let i = 0; i < text.length; i++) {
        let charElem = document.createElement("span");
        charElem.style.color = `hsl(${(360 * i / text.length)},80%,50%)`;
        charElem.innerHTML = text[i];
        subtitle.appendChild(charElem);
    }
    subtitle.style.textShadow = "1px 1px 0 #451b50, 1px 1px 0 #451b50";     //try to add outline to make it more visible
}

function changeTitlesOnLoss() {
    $.get("/Game/GetLossStreakCount", function (lossStreakCount, status) {
        console.log(`LossStreakCount from server was ${status}`);
        if (status !== "success") {
            console.warn(lossStreakCount);
            return;
        }

        let subtitleText;               //show the amount of reties on subtitle
        switch (lossStreakCount) {
            case 0:
                subtitleText = "st ";
                break;
            case 1:
                subtitleText = "nd ";
                break;
            case 2:
                subtitleText = "rd ";
                break;
            default:
                subtitleText = "th ";
        }
        subtitleText = `${lossStreakCount + 1}${subtitleText} try's a charm,`;

        subtitleText = subtitleText.repeat(99);
        subtitleText = subtitleText.substring(0, subtitleText.length - 1);     //remove last comma

        let subtitlesArray = subtitleText.split(',');
        subtitlesArray.push("Gotta sweep, sweep, sweep!");                      //1% (1/100) chance to get this text
        changeTitles("Good luck!", subtitlesArray);
    });
}