function refreshCellEvents() {
    document.querySelectorAll('.cell').forEach(cellHtml => {
        cellHtml.addEventListener('click', dispatchLeftClick);
        cellHtml.addEventListener('contextmenu', dispatchRightClick);
        cellHtml.addEventListener('mouseenter', dispatchMouseEnter);
        cellHtml.addEventListener('mouseleave', dispatchMouseLeave);
    });
};

function dispatchLeftClick(cellHtml) {
    const cell = cellHtml.target;
    const column = Number(cell.dataset.column);
    const row = Number(cell.dataset.row);

    cell.dispatchEvent(new CustomEvent("onCellLeftClick", {
        detail: { column, row },
        bubbles: true,
        composed: true
    }));
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