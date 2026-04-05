/**
 * Adds events to .partialCell divs insetad of the cellView/button itself, so those events dont have to be readded again if only the button gets reloaded.
 */
function refreshCellEvents() {
    $('#partialBoard .partialCell').each(function () {
        let partialCell = this;
        let cellView = this.firstElementChild;
        let cellModel = JSON.parse(cellView.dataset.model);

        //change class if its no longer interactable (0-cell) and remove flagging
        if (cellModel.IsRevealed && cellModel.NeighboringBombs == 0) {
            cellView.className = "empty cell";
            return;
        }

        $(partialCell).on({
            click: function () {
                if (cellModel.IsFlagged) {
                    console.log("dont l-click that flag cell now....");
                    return;
                }

                $.post('/Game/CellClicked', { myColumn: cellModel.Column, myRow: cellModel.Row }, function (data, status) {
                    console.log("cell in c", cellModel.Column, " r", cellModel.Row, "clicked, was: ", status);
                    if (status !== "success") {
                        return;
                    }

                    //reload the entire board
                    $('#partialBoard').load('/Game/GetBoard', function (data, status, xhr) {
                        console.log("boardView has been updated, was ", status);

                        if (status !== "success") {
                            console.warn(xhr);
                            return;
                        }
                        refreshBoardStats(this.children[1]);

                        //check if round is finished
                        $.get('/Game/GetIsFinished', function (data, status) {
                            if (status !== "success") {
                                console.warn(data);
                                return;
                            }

                            if (data) {     //check if round was won
                                $.get("/Game/GetIsWon", function (data, status) {
                                    if (status !== "success") {
                                        console.warn(data);
                                        return;
                                    }

                                    //add one or two classes for finishing the round, either by losing or winning
                                    $(".partialCell > button").each(function () {
                                        currentCellModel = JSON.parse(this.dataset.model);
                                        if (currentCellModel.IsRevealed && currentCellModel.NeighboringBombs == 0) {
                                            this.className = "empty cell";
                                        }

                                        $(this).addClass(data ? "won-game finished" : "finished");
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
                $(partialCell).load('/Game/ToggleFlag', { myColumn: cellModel.Column, myRow: cellModel.Row }, (data, status, xhr) => {
                    console.log("Flag was toggled on cell in c", cellModel.Column, " r", cellModel.Row, "was : ", status);

                    if (status != 'success') {
                        console.warn(xhr);
                        return;
                    }

                    cellView = partialCell.firstElementChild;
                    cellModel = JSON.parse(cellView.dataset.model);

                    $.get("/Game/GetSetFlagCount", (data, status) => {
                        if (status != 'success') {
                            console.warn(data);
                            return;
                        }

                        refreshAfterFlagToggle(data);
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