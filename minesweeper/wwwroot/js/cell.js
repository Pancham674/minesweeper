/**
 * Adds events to all .partialCell divs instead of the cellView/button itself, because partialCell reloads its content (the cellView)
 * so those events dont have to be reattached again. Except if the whole board gets reloaded (restart)
 */
function refreshCellEvents() {
    $('.partialCell').each(function () {
        let partialCell = this;
        let cellModel = JSON.parse(partialCell.firstElementChild.dataset.model);

        $(partialCell).on({         //attach click, contextmenu, mouseenter and -leave eventhandlers
            click: function () {
                if (cellModel.IsFlagged) {
                    console.log("dont l-click that flag cell now....");
                    return;
                }

                //click the specific cell and get JSON data of all cells that got revealed by that click
                $.getJSON("/Game/CellClicked", { myColumn: cellModel.Column, myRow: cellModel.Row }, function (revealedCellsArray, status, xhr) {
                    console.log("cell in c", cellModel.Column, " r", cellModel.Row, `clicked, was ${status}`);
                    if (status !== "success") {
                        console.warn("xhr:", xhr);
                        return;
                    }

                    //if round was lost, by clicking a bomb, then this would be false
                    if (revealedCellsArray.length == 0) { console.log("the click didnt do anything."); }
                    else {
                        let boardView = $("#board")[0];
                        revealedCellsArray.forEach(function (cell) {
                            console.log("c", cell.Column, "r", cell.Row, "was affected and is now revealed.");
                            let affectedPartialCell = boardView.children[cell.Row].children[cell.Column]

                            //refresh every cell, that has been affected, by reloading its partialCell
                            $(affectedPartialCell).load("/Game/GetCellView", { myColumn: cell.Column, myRow: cell.Row }, function (_, status, xhr) {
                                if (status !== "success") {
                                    console.warn("GetCellView from server occured in an error:", xhr);
                                    return;
                                }

                                //change class if it has no bombs around it and make it uninteractable
                                if (cell.IsRevealed && cell.NeighboringBombs == 0) { affectedPartialCell.firstElementChild.className = "empty cell"; }
                            });
                        });
                    }

                    //check if round is lost and call OnRoundFinished
                    $.get("/Game/GetIsRoundLost", function (isRoundLost, status) {
                        if (status !== "success") {
                            console.warn("GetIsRoundLost from server resulted in an error:", isRoundLost);
                            return;
                        }

                        if (isRoundLost) {
                            _boardIsRoundFinished = true;
                            OnRoundFinished(!isRoundLost);
                            return;
                        }

                        //check if its won instead and call OnRoundFinished too, otherwise round is still active
                        $.get("/Game/GetIsRoundWon", function (isRoundWon, status) {
                            if (status !== "success") {
                                console.warn("GetIsRoundWon from server resulted in an error:", response);
                                return;
                            }

                            if (isRoundWon) {
                                _boardIsRoundFinished = true;
                                OnRoundFinished(isRoundWon);
                                return;
                            }
                            _boardIsRoundFinished = false;
                        });
                    });

                    //get the current boardModel to update all stat elements
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

/**
 * refresh board and iterate through every cellView to add classes
 */
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

        if (isRoundWon) {       //congratulate player (yoy)
            changeTitles("Board Finished!", ["Congrats!", "Awesome!!", "Woahh!!!", "Amazing!!!!"]);
        } else {                //gg (gitgud)
            changeTitles("Game Over!", ["You lost the game!", "Better luck next time", "Stay determined!"]);
        }
    });
}