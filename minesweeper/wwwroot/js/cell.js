/**
 * Adds events to .partialCell divs insetad of the cellView/button itself, so those events dont have to be readded again if only the button gets reloaded.
 */
function refreshCellEvents() {
    $('.partialCell').each(function () {
        let partialCell = this;
        let cellView = this.firstElementChild;
        let cellModel = JSON.parse(cellView.dataset.model);

        //change class if it has no bombs around it and make it uninteractable
        if (cellModel.IsRevealed && cellModel.NeighboringBombs == 0) {
            cellView.className = "empty cell";
            return;
        }

        $(partialCell).on({         //attach click, contextmenu, mouseenter and -leave eventhandlers
            click: function () {
                if (cellModel.IsFlagged) {
                    console.log("dont l-click that flag cell now....");
                    return;
                }

                $.post("/Game/CellClicked", { myColumn: cellModel.Column, myRow: cellModel.Row }, function (response, status) {
                    console.log("cell in c", cellModel.Column, " r", cellModel.Row, " clicked, was: "+ status);
                    if (status !== "success") {
                        return;
                    }

                    //reload the entire board
                    $("#partialBoard").load("/Game/GetBoard", function (response, status, xhr) {
                        console.log("boardView has been updated, was ", status);

                        if (status !== "success") {
                            console.warn(xhr);
                            return;
                        }
                        refreshBoardStats(this.children[0]);

                        //check if round is finished
                        $.get("/Game/GetIsFinished", function (isFinished, status) {
                            if (status !== "success") {
                                console.warn(isFinished);
                                return;
                            }

                            _boardIsRoundFinished = isFinished;
                            if (isFinished) {     //check if round was won
                                $.get("/Game/GetIsWon", function (isRoundWon, status) {
                                    if (status !== "success") {
                                        console.warn(isRoundWon);
                                        return;
                                    }

                                    //add one or two classes for finishing the round, either from losing or winning
                                    $(".partialCell > button").each(function () {
                                        cellModel = JSON.parse(this.dataset.model);
                                        if (cellModel.IsRevealed && cellModel.NeighboringBombs == 0) {
                                            this.className = "empty cell";
                                        }

                                        $(this).addClass(isRoundWon ? "won-game finished" : "finished");
                                    });
                                });
                                return;
                            }

                            refreshCellEvents();            //partialBoard has been reloaded, add every event to each partial cell again.
                        });
                    });
                });
            },

            contextmenu: function (e) {
                $(partialCell).load("/Game/ToggleFlag", { myColumn: cellModel.Column, myRow: cellModel.Row }, (response, status, xhr) => {
                    console.log("Flag was toggled on cell in c", cellModel.Column, " r", cellModel.Row, "was : ", status);

                    if (status != "success") {
                        console.warn(xhr);
                        return;
                    }

                    cellView = partialCell.firstElementChild;
                    cellModel = JSON.parse(cellView.dataset.model);

                    $.get("/Game/GetSetFlagCount", (setFlagCount, status) => {
                        if (status != "success") {
                            console.warn(setFlagCount);
                            return;
                        }

                        refreshAfterFlagToggle(setFlagCount);
                    });
                });
            },

            mouseenter: function () {
                ToggleClassOnHover(cellModel, partialCell.parentElement.parentElement, true);
            },

            mouseleave: function () {
                ToggleClassOnHover(cellModel, partialCell.parentElement.parentElement, false);
            }
        });
    });
}