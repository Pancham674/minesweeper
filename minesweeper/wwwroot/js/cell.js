const STATE_NOT_STARTED = "NotStarted";
const STATE_ACTIVE = "Active";
const STATE_LOST = "Lost";
const STATE_WON = "Won";
function refreshCellEvents() {
    $('.partialCell').each(function () {
        let partialCell = this;
        let cellModel = JSON.parse(partialCell.firstElementChild.dataset.model);
        $(partialCell).on({
            click: function () {
                if (cellModel.IsFlagged) {
                    console.log("dont l-click that flag cell now....");
                    return;
                }
                $.getJSON("/Game/CellClicked", { myColumn: cellModel.Column, myRow: cellModel.Row }, function (revealedCellsArray, status, xhr) {
                    console.log("cell in c", cellModel.Column, " r", cellModel.Row, `clicked, was ${status}`);
                    if (status !== "success") {
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
                                if (status !== "success") {
                                    console.warn("GetCellView from server occured in an error:", xhr);
                                    return;
                                }
                                if (cell.IsRevealed && cell.NeighboringBombs == 0) {
                                    affectedPartialCell.firstElementChild.className = "empty cell";
                                }
                            });
                        });
                    }
                    $.get("/Game/GetCurrentState", function (currentState, status) {
                        if (status !== "success") {
                            console.warn("GetCurrentState from server resulted in an error:", currentState);
                            return;
                        }
                        if (currentState != STATE_ACTIVE && currentState != STATE_NOT_STARTED) {
                            OnRoundFinished(currentState == STATE_WON);
                        }
                    });
                    $.getJSON("/Game/GetBoardModel", function (boardModel, status) {
                        if (status !== "success") {
                            console.warn("GetBoardModel from server resulted in an error:", boardModel);
                            return;
                        }
                        refreshBoardStats(boardModel);
                    });
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
                        cellModel = JSON.parse(partialCell.firstElementChild.dataset.model);
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
            mouseenter: function () { ToggleClassOnHover(JSON.parse(partialCell.firstElementChild.dataset.model), partialCell.parentElement.parentElement, true); },
            mouseleave: function () { ToggleClassOnHover(JSON.parse(partialCell.firstElementChild.dataset.model), partialCell.parentElement.parentElement, false); }
        });
    });
}
function OnRoundFinished(isRoundWon) {
    $("#partialBoard").load("/Game/GetBoardView", function (_, status, xhr) {
        console.log(`OnRoundFinished: GetBoardView from server was ${status}`);
        if (status !== "success") {
            console.warn(xhr);
            return;
        }
        $(".partialCell > button").each(function (i, cellView) {
            let cellModel = JSON.parse(cellView.dataset.model);
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
//# sourceMappingURL=cell.js.map