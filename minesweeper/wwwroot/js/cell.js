/**
 * Adds events to .partialCell divs insetad of the cellView/button itself, so those events dont have to be readded again if only the button gets reloaded.
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
                    console.log("cell in c", cellModel.Column, " r", cellModel.Row, " clicked, was: " + status);
                    if (status !== "success") {
                        console.log(`xhr: ${xhr}`)
                        return;
                    }

                    if (revealedCellsArray.length == 0) {
                        console.log("the click didnt affect anything.");
                    }

                    let boardView = $("#board")[0];
                    revealedCellsArray.forEach(function (cell) {
                        console.log("c", cell.Column, "r", cell.Row, "was affected and is now revealed.");
                        let affectedPartialCell = boardView.children[cell.Row].children[cell.Column]

                        //refresh every cell, that has been affected, by reloading its partialCell
                        $(affectedPartialCell).load("/Game/GetCellView", { myColumn: cell.Column, myRow: cell.Row }, function (response, status, xhr) {
                            if (status !== "success") {
                                console.warn(`error on ${cell.Column, cell.Row}: ${xhr}`);
                                return;
                            }

                            //change class if it has no bombs around it and make it uninteractable
                            if (cell.IsRevealed && cell.NeighboringBombs == 0) {
                                affectedPartialCell.firstElementChild.className = "empty cell";
                            }
                        });
                    });


                    //check if round is finished
                    $.get("/Game/GetIsRoundFinished", function (isFinished, status) {
                        if (status !== "success") {
                            console.warn(isFinished);
                            return;
                        }

                        _boardIsRoundFinished = isFinished;

                        if (isFinished) { 
                            let isRoundWon;

                            $.get("/Game/GetIsRoundWon", function (response, status) {         //check if round was won
                                if (status !== "success") {
                                    console.warn(response);
                                    return;
                                }
                                isRoundWon = response;

                                //add one or two classes for finishing the round, either from losing or winning
                                $(".partialCell > button").each(function (i, cellView) {
                                    $(cellView.parentElement).off("click contextmenu mouseenter mouseleave");

                                    let currentCellModel = JSON.parse(cellView.dataset.model);
                                    if (currentCellModel.IsRevealed && currentCellModel.NeighboringBombs == 0) {
                                        cellView.className = "empty cell";
                                    }

                                    $(cellView).addClass(isRoundWon ? "won-game finished" : "finished");
                                });
                            });

                            //get and show every bomb
                            $.getJSON("/Game/GetBombs", function (bombsArray, status) {
                                if (status !== "success") {
                                    console.warn(bombsArray);
                                    return;
                                }

                                let boardView = $("#board")[0];
                                bombsArray.forEach(function (cell) {
                                    let affectedPartialCell = boardView.children[cell.Row].children[cell.Column];

                                    //show every bomb by reloading its partialCell
                                    $(affectedPartialCell).load("/Game/GetCellView", { myColumn: cell.Column, myRow: cell.Row }, function (response, status, xhr) {
                                        if (status !== "success") {
                                            console.warn(`error on ${cell.Column, cell.Row}: ${xhr}`);
                                            return;
                                        }
                                        console.log("c", cell.Column, "r", cell.Row, "was a bomb and is now revealed.");
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
                    });

                    //get the current boardModel to update all stat elements
                    $.getJSON("/Game/GetBoardModel", function (boardModel, status) {
                        if (status !== "success") {
                            console.warn(boardModel);
                            return;
                        }
                        refreshBoardStats(boardModel);
                    });
                });
            },

            contextmenu: function () {
                $.post("/Game/ToggleFlag", { myColumn: cellModel.Column, myRow: cellModel.Row }, function (wasToggled, status) {
                    if (status != "success") {
                        console.warn(xhr);
                        return;
                    }

                    if (!wasToggled) {
                        console.log("this flag toggled on cell in c", cellModel.Column, " r", cellModel.Row, " didnt do jack!!");
                        return;
                    }

                    console.log("Flag was toggled on cell in c", cellModel.Column, " r", cellModel.Row, "was : ", status);
                    $(partialCell).load("/Game/GetCellView", { myColumn: cellModel.Column, myRow: cellModel.Row }, function (response, status, xhr) {
                        if (status != "success") {
                            console.warn(xhr);
                            return;
                        }

                        cellModel = JSON.parse(partialCell.firstElementChild.dataset.model);

                        $.get("/Game/GetSetFlagCount", (setFlagCount, status) => {
                            if (status != "success") {
                                console.warn(setFlagCount);
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