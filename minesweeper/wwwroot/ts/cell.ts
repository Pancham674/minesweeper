import * as Model from "./Model.js"
import { toggleClassOnHover, refreshBoardStats, changeTitles, refreshAfterFlagToggle } from "./game.js"

/**
* Adds events to all .partialCell divs instead of the cellView/button itself, because partialCell reloads its content (the cellView)
* so those events dont have to be reattached again. Except if the whole board gets reloaded (restart)
*/
export function refreshCellEvents() {
    $('.partialCell').each(function () {
        let partialCell = this as HTMLDivElement;
        let cellModel: Model.Cell = GetCellModel(partialCell.firstElementChild as HTMLButtonElement);

        $(partialCell).on({         //attach click, contextmenu, mouseenter and -leave eventhandlers
            click: function () {
                if (cellModel.IsFlagged) {
                    console.log("dont l-click that flag cell now....");
                    return;
                }

                //click the specific cell and get JSON data of all cells that got revealed by that click
                $.getJSON("/Game/CellClicked", { myColumn: cellModel.Column, myRow: cellModel.Row }, function (revealedCellsArray, status, xhr) {
                    console.log("cell in c", cellModel.Column, " r", cellModel.Row, `clicked, was ${status}`);
                    if (status != "success") {
                        console.warn("xhr:", xhr);
                        return;
                    }

                    //if round was lost, by clicking a bomb, then this would be false
                    if (revealedCellsArray.length == 0) { console.log("the click didnt do anything."); }
                    else {
                        cellModel = GetCellModel(partialCell.firstElementChild as HTMLButtonElement);

                        let boardView = $("#board")[0] as HTMLDivElement;
                        revealedCellsArray.forEach(function (cell) {
                            console.log("c", cell.Column, "r", cell.Row, "was affected and is now revealed.");
                            let affectedPartialCell = boardView.children[cell.Row].children[cell.Column] as HTMLDivElement;

                            //refresh every cell, that has been affected, by reloading its partialCell
                            $(affectedPartialCell).load("/Game/GetCellView", { myColumn: cell.Column, myRow: cell.Row }, function (_, status, xhr) {
                                if (status != "success") {
                                    console.warn("GetCellView from server occured in an error:", xhr);
                                    return;
                                }

                                //change class if it has no bombs around it and make it uninteractable
                                if (cell.IsRevealed && cell.NeighboringBombs == 0) { affectedPartialCell.firstElementChild.className = "empty cell"; }
                            });
                        });
                    }

                    //get the current state and call OnRoundFinished if its lost or won
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

                        cellModel = GetCellModel(partialCell.firstElementChild as HTMLButtonElement);

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

            mouseenter: function () { toggleClassOnHover(GetCellModel(partialCell.firstElementChild as HTMLButtonElement), true); },
            mouseleave: function () { toggleClassOnHover(GetCellModel(partialCell.firstElementChild as HTMLButtonElement), false); }
        });
    });
}

/**
 * refresh board and iterate through every cellView to add classes
 */
function OnRoundFinished(isRoundWon: boolean) {
    $("#partialBoard").load("/Game/GetBoardView", function (_, status, xhr) {
        console.log(`OnRoundFinished: GetBoardView from server was ${status}`);
        if (status != "success") {
            console.warn(xhr);
            return;
        }

        $(".partialCell > button").each(function (i, cellView: HTMLButtonElement) {
            let cellModel = GetCellModel(cellView);

            if (cellModel.IsRevealed && cellModel.NeighboringBombs == 0) {
                cellView.className = "empty cell";
            }
            $(cellView).addClass(isRoundWon ? "won-game finished" : "finished");
        });

        if (isRoundWon) {       //congratulate player (yoy)
            changeTitles("Board Finished!", ["Congrats!", "Awesome!!", "Woahh!!!", "Amazing!!!!"]);
        } else {                //gg (gitgud)
            changeTitles("Game Over!", ["You lost the game!", "Better luck next time", "Stay determined!"]);
        }
    });
}

export function GetCellModel(cellView: HTMLButtonElement): Model.Cell {
    let column: number = parseInt(cellView.dataset.column);
    let row: number = parseInt(cellView.dataset.row);
    let neighboringBombs: number = parseInt(cellView.dataset.neighboringbombs);

    let isFlagged: boolean = cellView.dataset.isflagged.toLowerCase() == "true";
    let isRevealed: boolean = cellView.dataset.isrevealed.toLowerCase() == "true";
    let isExploded: boolean = cellView.dataset.isexploded.toLowerCase() == "true";

    return new Model.Cell(column, row, neighboringBombs, isFlagged, isRevealed, isExploded);
}