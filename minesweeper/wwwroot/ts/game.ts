import  * as Model from "./Model.js"
import { refreshCellEvents } from "./cell.js"

let _boardModel;
let _lifesStat: HTMLParagraphElement;
let _boardProgressStat: HTMLParagraphElement;
let _remainingFlagsStat: HTMLParagraphElement;

$(() => {
    console.log("document is ready");

    _remainingFlagsStat = $("#remainingFlags")[0] as HTMLParagraphElement;
    _boardProgressStat = $("#boardProgress")[0] as HTMLParagraphElement;
    _lifesStat = $("#lifes")[0] as HTMLParagraphElement;

    getBoardView();
    $("#partialBoard").on("contextmenu", function(e) { e.preventDefault(); });

    let resetBtn: HTMLCollectionOf<HTMLButtonElement> = $(".buttons .resetsGame") as unknown as HTMLCollectionOf<HTMLButtonElement>;
    for (let i = 0; i < resetBtn.length; i++){
        (resetBtn[i] as HTMLButtonElement).onclick = function() { resetRound(resetBtn[i], null, null, null) };
    }

    ($(".resetbtn")[0] as HTMLButtonElement).onclick = function () {
        let board = JSON.parse(($("#board")[0] as HTMLDivElement).dataset.model);
        resetRound(this as HTMLElement, board.Columns, board.Rows, null);
    };

    let customizable: HTMLDivElement = $(".customizable")[0] as HTMLDivElement;
    $(customizable).hide();

    ($(".customizable-btn")[0] as HTMLButtonElement).onclick = function () {
        let custombtn = this as HTMLButtonElement;

        //change the direction in custombtn based on if settings is shown or not
        if (!customizable.checkVisibility()) {
            custombtn.innerHTML = `\<<br>\<`;
        }
        else {
            custombtn.innerHTML = `\><br>\>`;
        }
        $(customizable).toggle("slow", "swing");
    };

    //sets number input width to its placeholder text
    let inputs = $("input") as unknown as HTMLCollectionOf<HTMLInputElement>;
    for (let i: number = 0; i < inputs.length; i++) {
        inputs[i].setAttribute("size", inputs[i].getAttribute("placeholder").length.toString());
    };
})

/**
* Will reset the game though communication with server.
* If customColumn and -Row are undefined then the data will be retrieved from the sender.
* Will not change life count stat if its undefined.
*/
function resetRound(sender: HTMLElement, customColumn: number, customRow: number, customLifesCount: number):void {
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

        let column: number = customColumn === null ? parseInt($(sender).data("column")) : customColumn;
        let row: number = customRow === null ? parseInt($(sender).data("row")) : customRow;

        if (!customLifesCount) {            //reset without setting life count
            resetWithNewSize(column, row);
            return;
        }

        resetGameWithNewSizeAndLifes(column, row, customLifesCount);
        console.log("Game has been reset");
    });
}

/**
 * Loads the #partialBoard element with a new Board and sets new life.
 */
function resetGameWithNewSizeAndLifes(column, row, customLifesCount): void {
    $("#partialBoard").load("/Game/ResetRoundAndSetLifes", { myColumn: column, myRow: row, myLifes: customLifesCount }, function (_, stat, xhr) {
        console.log(`"ResetRoundAndSetLifes from server was ${stat}`);

        if (stat != "success") {
            console.warn("xhr:", xhr);
            return;
        }

        refreshUIBoardElements();
    });
}

function resetWithNewSize(column: number, row: number): void {
    $("#partialBoard").load("/Game/ResetRound", { myColumn: column, myRow: row }, function (_, stat, xhr) {
        console.log(`ResetRound from server was ${stat}`);

        if (stat != "success") {
            console.warn("xhr:", xhr);
            return;
        }

        refreshUIBoardElements();
    });
}

function getBoardView(): void {
    $("#partialBoard").load("/Game/GetBoardView", function (_, stat, xhr) {
        console.log(`GetBoardView from server was ${stat}`);

        if (stat != "success") {
            console.warn("xhr:", xhr);
            return;
        }
        refreshUIBoardElements();
    });
}

function refreshUIBoardElements(): void {
    refreshCellEvents();
    refreshBoardStats($("#board")[0] as HTMLDivElement);
    changeTitlesOnLoss();
}

/**
 * Refreshes the current statistics shown to the player.
 */
export function refreshBoardStats(currentBoard: HTMLDivElement) {
    if (currentBoard.id) {
        _boardModel = JSON.parse(currentBoard.dataset.model);
    } else { _boardModel = currentBoard; }

    console.log("boardModel has been updated to current")

    refreshAfterFlagToggle(_boardModel.SetFlagCount);
    _lifesStat.innerHTML = `<b>Lifes:</b><br>${_boardModel.LifeCount}`;

    let nonBombCellsCount = _boardModel.CellsCount - _boardModel.BombsCount;
    _boardProgressStat.innerHTML = `<b>Covered Cells:</b><br>${nonBombCellsCount - _boardModel.RevealedCellsCount}/${nonBombCellsCount}`;
}

export function refreshAfterFlagToggle(currentSetFlagCount: number)  {
    _remainingFlagsStat.innerHTML = `<b>Remaining flags:</b><br>${_boardModel.BombsCount - currentSetFlagCount}/${_boardModel.BombsCount}`;
}

/**
 * Highlights the unrevealed neighbors of a revealed cell by adding or removing a classname based on if its currently hovered on or not.
 * Intended to help the player see the neighbors more clearly for chording.
 */
export function toggleClassOnHover(cellModel, boardView: HTMLElement, isHovering: boolean) {
    //only neighbors of revealed cells should be marked
    if (!cellModel.IsRevealed || cellModel.IsExploded) { return; }

    //loop around cellModels neighbors
    for (let col = cellModel.Column - 1; col < cellModel.Column + 2; col++) {
        if (col < 0 || col > _boardModel.Columns - 1) { continue; }         //dont go out of the board

        for (let row = cellModel.Row - 1; row < cellModel.Row + 2; row++) {
            if (row < 0 || row > _boardModel.Rows - 1) { continue; }        //dont go out of the board

            const neighborView = boardView.children[row].children[col].firstElementChild as HTMLElement;
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
    let customRow: HTMLInputElement = $("#customRow")[0] as HTMLInputElement;
    let customCol: HTMLInputElement = $("#customColumn")[0] as HTMLInputElement;

    let customColValue: number = parseInt(customCol.value);
    let customRowValue: number = parseInt(customRow.value);

    if (isNaN(customColValue) || parseInt(customCol.min) > customColValue || parseInt(customCol.max) < customColValue ||
        isNaN(customRowValue) || parseInt(customRow.min) > customRowValue || parseInt(customRow.max) < customRowValue) {
        alert("Please choose a value between "+ customCol.min +" and "+ customCol.max +".");
        return;
    }

    resetRound(this as HTMLElement, customColValue, customRowValue, null);
}

/**
 * Accepts the custom life count if its valid and calls resetRound with the new attribute.
 */
function confirmLifeAmount() {
    let customLifes: HTMLInputElement = $("#customLifes")[0] as HTMLInputElement;
    let customLifesValue: number = parseInt(customLifes.value);

    if (isNaN(customLifesValue) || parseInt(customLifes.min) > customLifesValue || parseInt(customLifes.max) < customLifesValue) {
        alert("Please choose a life amount between "+ customLifes.min +" and "+ customLifes.max +".");
        return;
    }

    resetRound(this as HTMLElement, _boardModel.Columns, _boardModel.Rows, customLifesValue);
}

/**
 * Changes both title and subtitle
 */
export function changeTitles(titleText: string, subtitleText: string[]) {
    let title: HTMLHeadingElement = $("#title")[0] as HTMLHeadingElement;
    let subtitle: HTMLHeadingElement = $("#subtitle")[0] as HTMLHeadingElement;

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
    $.get("/Game/GetLossStreakCount", function (lossStreakCount: number, status) {
        console.log(`LossStreakCount from server was ${status}`);
        if (status != "success") {
            console.warn(lossStreakCount);
            return;
        }

        let subtitleText: string;               //show the amount of reties on subtitle
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
