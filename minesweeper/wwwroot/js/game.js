import * as Model from "./Model.js";
import { GetCellModel, refreshCellEvents } from "./cell.js";
let _boardModel;
let _lifesStat;
let _boardProgressStat;
let _remainingFlagsStat;
$(() => {
    console.log("document is ready");
    let customizable = $(".customizable")[0];
    $(customizable).hide();
    $(".customizable-btn")[0].onclick = function () {
        let custombtn = this;
        if (!customizable.checkVisibility()) {
            custombtn.innerHTML = `\<<br>\<`;
        }
        else {
            custombtn.innerHTML = `\><br>\>`;
        }
        $(customizable).toggle("slow", "swing");
    };
    _remainingFlagsStat = $("#remainingFlags")[0];
    _boardProgressStat = $("#boardProgress")[0];
    _lifesStat = $("#lifes")[0];
    getBoardView();
    $("#partialBoard").on("contextmenu", function (e) { e.preventDefault(); });
    let resetBtn = $(".buttons .resetsGame");
    for (let i = 0; i < resetBtn.length; i++) {
        resetBtn[i].onclick = function () { resetRound(resetBtn[i], null, null, null); };
    }
    $(".resetbtn")[0].onclick = function () {
        resetRound(this, _boardModel.Columns, _boardModel.Rows, null);
    };
    let inputs = $("input");
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].setAttribute("size", inputs[i].getAttribute("placeholder").length.toString());
    }
    ;
    $(".customSizeBtn")[0].onclick = () => confirmCustomSize();
    $(".customLifeBtn")[0].onclick = () => confirmLifeAmount();
});
function resetRound(sender, customColumn, customRow, customLifesCount) {
    $.get("/Game/GetCurrentState", function (currentState, status) {
        console.log(`GetCurrentState from server was ${status}`);
        if (status != "success") {
            console.warn(currentState);
            return;
        }
        if ((currentState == Model.RoundState.Active) && !confirm("Applying new settings will also reset the current round." +
            "\nAre you sure you want to continue?")) {
            return;
        }
        let column = customColumn === null ? parseInt($(sender).data("column")) : customColumn;
        let row = customRow === null ? parseInt($(sender).data("row")) : customRow;
        if (!customLifesCount) {
            resetWithNewSize(column, row);
            return;
        }
        resetGameWithNewSizeAndLifes(column, row, customLifesCount);
        console.log("Game has been reset");
    });
}
function resetGameWithNewSizeAndLifes(column, row, customLifesCount) {
    $("#partialBoard").load("/Game/ResetRoundAndSetLifes", { myColumn: column, myRow: row, myLifes: customLifesCount }, function (_, stat, xhr) {
        console.log(`"ResetRoundAndSetLifes from server was ${stat}`);
        if (stat != "success") {
            console.warn("xhr:", xhr);
            return;
        }
        refreshUIBoardElements();
    });
}
function resetWithNewSize(column, row) {
    $("#partialBoard").load("/Game/ResetRound", { myColumn: column, myRow: row }, function (_, stat, xhr) {
        console.log(`ResetRound from server was ${stat}`);
        if (stat != "success") {
            console.warn("xhr:", xhr);
            return;
        }
        refreshUIBoardElements();
    });
}
function getBoardView() {
    $("#partialBoard").load("/Game/GetBoardView", function (_, stat, xhr) {
        console.log(`GetBoardView from server was ${stat}`);
        if (stat != "success") {
            console.warn("xhr:", xhr);
            return;
        }
        refreshUIBoardElements();
    });
}
function refreshUIBoardElements() {
    refreshCellEvents();
    refreshBoardStats();
    changeTitlesOnLoss();
}
export function refreshBoardStats() {
    $.getJSON("/Game/GetBoardModel", function (boardModelObject, status) {
        if (status != "success") {
            console.warn("GetBoardModel from server resulted in an error:", boardModelObject);
            return;
        }
        _boardModel = GetBoardModel(boardModelObject);
        console.log("boardModel has been updated to current");
        refreshAfterFlagToggle(_boardModel.SetFlagCount);
        _lifesStat.innerHTML = `<b>Lifes:</b><br>${_boardModel.LifeCount}`;
        let nonBombCellsCount = _boardModel.CellsCount - _boardModel.BombsCount;
        _boardProgressStat.innerHTML = `<b>Covered Cells:</b><br>${nonBombCellsCount - _boardModel.RevealedCellsCount}/${nonBombCellsCount}`;
    });
}
export function refreshAfterFlagToggle(currentSetFlagCount) {
    _remainingFlagsStat.innerHTML = `<b>Remaining flags:</b><br>${_boardModel.BombsCount - currentSetFlagCount}/${_boardModel.BombsCount}`;
}
export function toggleClassOnHover(cellModel, isHovering) {
    if (!cellModel.IsRevealed || cellModel.IsExploded) {
        return;
    }
    let boardView = $("#board")[0];
    for (let col = cellModel.Column - 1; col < cellModel.Column + 2; col++) {
        if (col < 0 || col > _boardModel.Columns - 1) {
            continue;
        }
        for (let row = cellModel.Row - 1; row < cellModel.Row + 2; row++) {
            if (row < 0 || row > _boardModel.Rows - 1) {
                continue;
            }
            const neighborView = boardView.children[row].children[col].firstElementChild;
            const neighborModel = GetCellModel(neighborView);
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
function confirmCustomSize() {
    let customRow = $("#customRow")[0];
    let customCol = $("#customColumn")[0];
    let customColValue = parseInt(customCol.value);
    let customRowValue = parseInt(customRow.value);
    if (isNaN(customColValue) || parseInt(customCol.min) > customColValue || parseInt(customCol.max) < customColValue ||
        isNaN(customRowValue) || parseInt(customRow.min) > customRowValue || parseInt(customRow.max) < customRowValue) {
        alert("Please choose a value between " + customCol.min + " and " + customCol.max + ".");
        return;
    }
    resetRound(this, customColValue, customRowValue, null);
}
function confirmLifeAmount() {
    let customLifes = $("#customLifes")[0];
    let customLifesValue = parseInt(customLifes.value);
    if (isNaN(customLifesValue) || parseInt(customLifes.min) > customLifesValue || parseInt(customLifes.max) < customLifesValue) {
        alert("Please choose a life amount between " + customLifes.min + " and " + customLifes.max + ".");
        return;
    }
    resetRound(this, _boardModel.Columns, _boardModel.Rows, customLifesValue);
}
export function changeTitles(titleText, subtitleText) {
    let title = $("#title")[0];
    let subtitle = $("#subtitle")[0];
    title.textContent = titleText;
    let chosenSubtitle = subtitleText[Math.floor(Math.random() * subtitleText.length)];
    subtitle.textContent = chosenSubtitle;
    if (chosenSubtitle != subtitleText[99]) {
        subtitle.style.textShadow = "";
        return;
    }
    let text = subtitle.innerText;
    subtitle.innerHTML = "";
    for (let i = 0; i < text.length; i++) {
        let charElem = document.createElement("span");
        charElem.style.color = `hsl(${(360 * i / text.length)},80%,50%)`;
        charElem.innerHTML = text[i];
        subtitle.appendChild(charElem);
    }
    subtitle.style.textShadow = "1px 1px 0 #451b50, 1px 1px 0 #451b50";
}
function changeTitlesOnLoss() {
    $.get("/Game/GetLossStreakCount", function (lossStreakCount, status) {
        console.log(`LossStreakCount from server was ${status}`);
        if (status != "success") {
            console.warn(lossStreakCount);
            return;
        }
        let subtitleText;
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
        subtitleText = subtitleText.substring(0, subtitleText.length - 1);
        let subtitlesArray = subtitleText.split(',');
        subtitlesArray.push("Gotta sweep, sweep, sweep!");
        changeTitles("Good luck!", subtitlesArray);
    });
}
function GetBoardModel(boardModelJSON) {
    let col = parseInt(boardModelJSON.Columns);
    let row = parseInt(boardModelJSON.Rows);
    let cCount = parseInt(boardModelJSON.CellsCount);
    let bCount = parseInt(boardModelJSON.BombsCount);
    let lCount = parseInt(boardModelJSON.LifeCount);
    let sFCount = parseInt(boardModelJSON.SetFlagCount);
    let rCCount = parseInt(boardModelJSON.RevealedCellsCount);
    return new Model.Board(col, row, cCount, bCount, lCount, sFCount, rCCount);
}
//# sourceMappingURL=game.js.map