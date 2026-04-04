function refreshResetBtn() {
    $('.resetsGame.resetbtn').click(function () {
        console.log("Game has been reset");
        resetGame(this, $(this).data("column"), $(this).data("row"));
    });
}

/**
 * Adds events to .partialCell divs insetad of the cellView/button itself, so those events dont have to be readded again after a reload
 */
function refreshCellEvents() {
    $('#partialBoard .partialCell').each(function () {
        let partialCell = this;
        let cellView = this.firstElementChild;
        let cellModel = JSON.parse(cellView.dataset.model);

        if (cellModel.IsRevealed && cellModel.NeighboringBombs == 0) {
            cellView.className = "empty cell";
            $(partialCell).contextmenu((e) => { e.preventDefault(); })
            return;
        }
        else if (cellModel.IsExploded) {
            $(partialCell).contextmenu((e) => { e.preventDefault(); })
            return;
        }

        $(partialCell).on({
            click: function () {
                if (cellModel.IsFlagged) {
                    console.log("dont l-click that flag cell now....");
                    return;
                }

                $.post('/Game/CellClicked', { myColumn: cellModel.Column, myRow: cellModel.Row }, (data, status) => {
                    console.log("cell in c", cellModel.Column, " r", cellModel.Row, "clicked, was: ", status);
                    if (status !== "success") {
                        return;
                    }

                    $('#partialBoard').load('/Game/LoadBoard', function (data, status, xhr) {
                        console.log("board has been updated, was ", status);

                        if (status !== "success") {
                            console.log(xhr);
                            return;
                        }

                        refreshResetBtn();
                        refreshCellEvents();            //partialBoard has been reloaded, add every event to each partial cell again.
                    });
                });
            },

            contextmenu: function (e) {
                e.preventDefault();

                $(partialCell).load('/Game/ToggleFlag', { myColumn: cellModel.Column, myRow: cellModel.Row }, (data, status, xhr) => {
                    console.log("Flag was toggled on cell in c", cellModel.Column, " r", cellModel.Row, "was : ", status);
                    if (status != 'success') {
                        console.warn(xhr);
                        return;
                    }
                    cellView = partialCell.firstElementChild;
                    cellModel = JSON.parse(cellView.dataset.model);
                });
            },

            mouseenter: function () {
                onCellHoverStartEnd(cellModel, partialCell.parentElement.parentElement);
            },

            mouseleave: function () {
                onCellHoverStartEnd(cellModel, partialCell.parentElement.parentElement);
            }
        });
    });
}