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

                    if (revealedCellsArray.length == 0) {
                        console.log("the click didnt do anything.");
                    }

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
                            if (cell.IsRevealed && cell.NeighboringBombs == 0) {
                                affectedPartialCell.firstElementChild.className = "empty cell";
                            }
                        });
                    });


                    //check if round is lost
                    $.get("/Game/GetIsRoundLost", function (isRoundLost, status) {
                        if (status !== "success") {
                            console.warn("GetIsRoundLost from server resulted in an error:", isRoundLost);
                            return;
                        }

                        if (isRoundLost) {
                            _boardIsRoundFinished = true;
                            disableEveryCellViewOnRoundFinished(!isRoundLost);
                            return;
                        }

                        //if its not lost then check if its won
                        $.get("/Game/GetIsRoundWon", function (isRoundWon, status) {
                            if (status !== "success") {
                                console.warn("GetIsRoundWon from server resulted in an error:", response);
                                return;
                            }

                            if (isRoundWon) {
                                _boardIsRoundFinished = true;
                                disableEveryCellViewOnRoundFinished(isRoundWon);
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

            mouseenter: function () {
                ToggleClassOnHover(JSON.parse(partialCell.firstElementChild.dataset.model), partialCell.parentElement.parentElement, true);
            },

            mouseleave: function () {
                ToggleClassOnHover(JSON.parse(partialCell.firstElementChild.dataset.model), partialCell.parentElement.parentElement, false);
            }
        });
    });
}

/**
 * 
 */
function disableEveryCellViewOnRoundFinished(isRoundWon) {
    //adds one or two classes for finishing the round, either from losing or winning
    $(".partialCell > button").each(function (i, cellView) {
        $(cellView.parentElement).off("click contextmenu mouseenter mouseleave");

        let currentCellModel = JSON.parse(cellView.dataset.model);
        if (currentCellModel.IsRevealed && currentCellModel.NeighboringBombs == 0) {
            cellView.className = "empty cell";
        }

        $(cellView).addClass(isRoundWon ? "won-game finished" : "finished");
    });

    //get and show every bomb
    $.getJSON("/Game/GetBombs", function (bombsArray, status) {
        if (status !== "success") {
            console.warn("GetBombs from server occured in an error:", bombsArray);
            return;
        }

        let boardView = $("#board")[0];
        bombsArray.forEach(function (cell) {
            let affectedPartialCell = boardView.children[cell.Row].children[cell.Column];

            //show every bomb by reloading its partialCell
            $(affectedPartialCell).load("/Game/GetCellView", { myColumn: cell.Column, myRow: cell.Row }, function (_, status, xhr) {
                let consoleText = `c ${cell.Column}  r ${cell.Row}`;
                if (status !== "success") {
                    console.warn("GetCellView for", consoleText,"from server occured in an error:", xhr);
                    return;
                }
                console.log(consoleText, "was a bomb and is now revealed.");
                $(affectedPartialCell.firstElementChild).addClass(isRoundWon ? "won-game finished" : "finished");
            });
        });

        if (isRoundWon) {       //congratulate player (yoy)
            changeTitles("Board Finished!", ["Awesome!", "Congrats!!", "Amazing!!!"]);
        } else {                //gg (gitgud)
            changeTitles("Game Over!", ["You lost the game!", "Better luck next time", "Stay determined!"]);
        }
    });
}