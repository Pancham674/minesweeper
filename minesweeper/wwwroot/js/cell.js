function refreshCellEvents() {
    $('.partialCell').each(function () {
        $(this).on('click', function () {
            const cellView = this.firstElementChild;
            const cellModel = JSON.parse(cellView.dataset.model);

            //reload the cell within partialCell to show current status
            $(this).load('/Game/CellClicked', { myColumn: cellModel.Column, myRow: cellModel.Row }, (data, status, xhr) => {
                console.log("cell on c", cellModel.Column, " r", cellModel.Row, "was clicked: ", status);
                if (status != 'success') {
                    console.warn(xhr);
                    return;
                }

                if (cellModel.NeighboringBombs == 0) {
                    disableEvents(this);
                    cellView.className = "empty cell";
                    uncoverNeighboringCells(this, cellView, cellModel);
                }

                changeBoardProgress();
            });
        });

        //el.addEventListener('contextmenu', dispatchRightClick);
        //el.addEventListener('mouseenter', dispatchMouseEnter);
        //el.addEventListener('mouseleave', dispatchMouseLeave);
    });
};

function disableEvents(partialCell) {
    $(partialCell).off('click');
    $(partialCell).off('contextmenu');
    $(partialCell).on('contextmenu', (e) => { e.preventDefault() });
    $(partialCell).off('mouseenter');
    $(partialCell).off('mouseleave');
}

function dispatchRightClick(cellHtml) {
    const cell = cellHtml.target;
    const column = Number(cell.dataset.column);
    const row = Number(cell.dataset.row);

    cellHtml.preventDefault();
    cell.dispatchEvent(new CustomEvent('onCellRightClick', {
        detail: { column, row },
        bubbles: true,
        composed: true
    }));
}

function dispatchMouseEnter(cellHtml) {
    const cell = cellHtml.target;
    const column = Number(cell.dataset.column);
    const row = Number(cell.dataset.row);

    cell.dispatchEvent(new CustomEvent('onCellHover', {
        detail: { column, row },
        bubbles: true,
        composed: true
    }));
}

function dispatchMouseLeave(cellHtml) {
    const cell = cellHtml.target;
    const column = Number(cell.dataset.column);
    const row = Number(cell.dataset.row);

    cell.dispatchEvent(new CustomEvent('onCellHoverEnded', {
        detail: { column, row },
        bubbles: true,
        composed: true
    }));
}