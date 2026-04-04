/**
 * Adds events to .partialCell divs insetad of the cellView/button itself, so those events dont have to be readded again after a reload
 */
function refreshCellEvents() {
    $('.partialCell').each(function () {    //always refresh cellView and -Model cuz we work with its updated data
        $(this).on({
            click: function () {
                let cellView = this.firstElementChild;
                let cellModel = JSON.parse(cellView.dataset.model);

                //$.get('/Game/GetCell', { myColumn: column, myRow: row }, function (data, status) {
                //    console.log("GetCell returned", status);
                //    if (status !== 'success') {
                //        return;
                //    }

                //    cellModel = JSON.parse(data);
                //});

                if (cellModel.IsFlagged) {
                    console.log("flagged cell in c", cellModel.Column, " r", cellModel.Row, " was ignored")
                    return;
                }
                else if (cellModel.IsBomb) {
                    disableEvents(this);

                    //if (_lifeAmount <= 0) {
                    //    revealBoard(false);
                    //    changeTitles("Game Over!", ["You lost the game!", "Better luck next time", "Stay determined!"]);
                    //    return;
                    //}
                }
                // check if cell got revealed in the view (player wants to use chord)
                else if (cellView.textContent.includes(cellModel.NeighboringBombs)) {
                    $.post('/Game/CellChord', { myColumn: cellModel.Column, myRow: cellModel.Row }, function (data, status) {
                        console.log("chord in c", cellModel.Column, " r", cellModel.Row, "was", status);
                        if (status !== 'success') {
                            console.warn(data);
                        }

                        Chord(cellModel, cellView);
                    });
                    return;
                }

                //reload the cell within partialCell to show current status
                $(this).load('/Game/CellClicked', { myColumn: cellModel.Column, myRow: cellModel.Row }, (data, status, xhr) => {
                    console.log("cell on c", cellModel.Column, " r", cellModel.Row, "was clicked: ", status);
                    if (status != 'success') {
                        console.warn(xhr);
                        return;
                    }

                    //refresh those elements too
                    cellView = this.firstElementChild;
                    cellModel = JSON.parse(cellView.dataset.model);

                    if (cellModel.NeighboringBombs == 0) {
                        console.log("neighbors were revealed too");
                        disableEvents(this);
                        cellView.className = "empty cell";        //wont change if neighborView is used...
                        uncoverNeighboringCells(cellView, cellModel);
                    }

                    changeBoardProgress();
                });
            },

            contextmenu: function (e) {
                e.preventDefault();
                const cellView = this.firstElementChild;
                const cellModel = JSON.parse(cellView.dataset.model);

                if (cellView.textContent.includes(cellModel.NeighboringBombs) || cellView.textContent.includes("💥")) {
                    console.log("Cant flag cell in c", cellModel.Column, " r", cellModel.Row, "was because its revealed");
                    return;
                }

                //reload the cell within partialCell to show current status
                $(this).load('/Game/ToggleFlag', { myColumn: cellModel.Column, myRow: cellModel.Row }, (data, status, xhr) => {
                    console.log("Flag was toggled on cell in c", cellModel.Column, " r", cellModel.Row, "was : ", status);
                    if (status != 'success') {
                        console.warn(xhr);
                        return;
                    }
                });
            },

            mouseenter: function () {
                const cellView = this.firstElementChild;
                const cellModel = JSON.parse(cellView.dataset.model);


            },

            mouseleave: function () {
                const cellView = this.firstElementChild;
                const cellModel = JSON.parse(cellView.dataset.model);


            }
        });
    });
};

function disableEvents(partialCell) {
    $(partialCell).off('click contextmenu mouseenter mouseleave');
    $(partialCell).on('contextmenu', (e) => { e.preventDefault() });
}