document.querySelectorAll('#cell').forEach(cellHtml => {
    const cellColumn = Number(cellHtml.dataset.column);
    const cellRow = Number(cellHtml.dataset.row);

    cellHtml.addEventListener('click', () => {
        cellHtml.dispatchEvent(new CustomEvent("onCellLeftClick", {
            detail: { cellColumn, cellRow },
            bubbles: true,
            composed: true
        }));
    });

    cellHtml.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        cellHtml.dispatchEvent(new CustomEvent('onCellRightClick', {
            detail: { cellColumn, cellRow },
            bubbles: true,
            composed: true
        }));
    });

    cellHtml.addEventListener('mouseenter', () => {
        cellHtml.dispatchEvent(new CustomEvent('onCellHover', {
            detail: { cellColumn, cellRow },
            bubbles: true,
            composed: true
        }));
    });

    cellHtml.addEventListener('mouseleave', () => {
        cellHtml.dispatchEvent(new CustomEvent('onCellHoverEnded', {
            detail: { cellColumn, cellRow },
            bubbles: true,
            composed: true
        }));
    });
});