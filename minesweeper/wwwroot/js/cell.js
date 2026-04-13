import * as Model from "./Model.js";
import { toggleClassOnHover, refreshBoardStats, changeTitles, refreshAfterFlagToggle } from "./game.js";
export function refreshCellEvents() {
    $('.partialCell').each(function () {
        let partialCell = this;
        let cellModel = GetCellModel(partialCell.firstElementChild);
        $(partialCell).on({
            click: function () {
                if (cellModel.IsFlagged) {
                    console.log("dont l-click that flag cell now....");
                    return;
                }
                $.getJSON("/Game/CellClicked", { myColumn: cellModel.Column, myRow: cellModel.Row }, function (revealedCellsArray, status, xhr) {
                    console.log("cell in c", cellModel.Column, " r", cellModel.Row, `clicked, was ${status}`);
                    if (status != "success") {
                        console.warn("xhr:", xhr);
                        return;
                    }
                    if (revealedCellsArray.length == 0) {
                        console.log("the click didnt do anything.");
                    }
                    else {
                        let boardView = $("#board")[0];
                        revealedCellsArray.forEach(function (cell) {
                            console.log("c", cell.Column, "r", cell.Row, "was affected and is now revealed.");
                            let affectedPartialCell = boardView.children[cell.Row].children[cell.Column];
                            $(affectedPartialCell).load("/Game/GetCellView", { myColumn: cell.Column, myRow: cell.Row }, function (_, status, xhr) {
                                if (status != "success") {
                                    console.warn("GetCellView from server occured in an error:", xhr);
                                    return;
                                }
                                cellModel = GetCellModel(partialCell.firstElementChild);
                                if (cell.IsRevealed && cell.NeighboringBombs == 0) {
                                    affectedPartialCell.firstElementChild.className = "empty cell";
                                }
                            });
                        });
                    }
                    $.get("/Game/GetCurrentState", function (currentState, status) {
                        if (status != "success") {
                            console.warn("GetCurrentState from server resulted in an error:", currentState);
                            return;
                        }
                        if (currentState != Model.RoundState.Active && currentState != Model.RoundState.NotStarted) {
                            OnRoundFinished(currentState == Model.RoundState.Won);
                        }
                    });
                    refreshBoardStats();
                });
            },
            contextmenu: function () {
                $.post("/Game/ToggleFlag", { myColumn: cellModel.Column, myRow: cellModel.Row }, function (wasToggled, status) {
                    if (status != "success") {
                        console.warn("ToggleFlag from server resulted in an error:", wasToggled);
                        return;
                    }
                    if (!wasToggled) {
                        console.log("flag toggle on cell in c", cellModel.Column, " r", cellModel.Row, " didnt do jack!!");
                        return;
                    }
                    console.log("Flag was toggled on cell in c", cellModel.Column, " r", cellModel.Row, "was : ", status);
                    $(partialCell).load("/Game/GetCellView", { myColumn: cellModel.Column, myRow: cellModel.Row }, function (_, status, xhr) {
                        if (status != "success") {
                            console.warn("GetCellView from server occured in an error:", xhr);
                            return;
                        }
                        cellModel = GetCellModel(partialCell.firstElementChild);
                        $.get("/Game/GetSetFlagCount", (setFlagCount, status) => {
                            if (status != "success") {
                                console.warn("GetSetFlagCount from server occured in an error:", setFlagCount);
                                return;
                            }
                            refreshAfterFlagToggle(setFlagCount);
                        });
                    });
                });
            },
            mouseenter: function () { toggleClassOnHover(cellModel, partialCell.parentElement.parentElement, true); },
            mouseleave: function () { toggleClassOnHover(cellModel, partialCell.parentElement.parentElement, false); }
        });
    });
}
function OnRoundFinished(isRoundWon) {
    $("#partialBoard").load("/Game/GetBoardView", function (_, status, xhr) {
        console.log(`OnRoundFinished: GetBoardView from server was ${status}`);
        if (status != "success") {
            console.warn(xhr);
            return;
        }
        $(".partialCell > button").each(function (i, cellView) {
            let cellModel = GetCellModel(cellView);
            if (cellModel.IsRevealed && cellModel.NeighboringBombs == 0) {
                cellView.className = "empty cell";
            }
            $(cellView).addClass(isRoundWon ? "won-game finished" : "finished");
        });
        if (isRoundWon) {
            changeTitles("Board Finished!", ["Congrats!", "Awesome!!", "Woahh!!!", "Amazing!!!!"]);
        }
        else {
            changeTitles("Game Over!", ["You lost the game!", "Better luck next time", "Stay determined!"]);
        }
    });
}
export function GetCellModel(cellView) {
    let column = parseInt(cellView.dataset.column);
    let row = parseInt(cellView.dataset.row);
    let neighboringBombs = parseInt(cellView.dataset.neighboringbombs);
    let isFlagged = cellView.dataset.isflagged.toLowerCase() == "true";
    let isRevealed = cellView.dataset.isrevealed.toLowerCase() == "true";
    let isExploded = cellView.dataset.isexploded.toLowerCase() == "true";
    return new Model.Cell(column, row, neighboringBombs, isFlagged, isRevealed, isExploded);
}
//# sourceMappingURL=cell.js.map