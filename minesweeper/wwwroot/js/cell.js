document.querySelectorAll('#cell').forEach(cellHtml => {
    const cellModel = JSON.parse(cellHtml.dataset.cell);

    cellHtml.addEventListener('click', () => {
        cellHtml.dispatchEvent(new CustomEvent("onCellLeftClick", {
            detail: { cellModel, cellHtml },
            bubbles: true,
            composed: true
        }));
    });

    cellHtml.addEventListener('contextmenu', (e) => {
        e.preventDefault();

        cellHtml.dispatchEvent(new CustomEvent('onCellRightClick', {
            detail: { cellModel, cellHtml },
            bubbles: true,
            composed: true
        }));
    });

    cellHtml.addEventListener('mouseenter', () => {
        cellHtml.dispatchEvent(new CustomEvent('onCellHover', {
            detail: { cellModel, cellHtml },
            bubbles: true,
            composed: true
        }));
    });

    cellHtml.addEventListener('mouseleave', (e) => {
        cellHtml.dispatchEvent(new CustomEvent('onCellHoverEnded', {
            detail: { cellModel, cellHtml },
            bubbles: true,
            composed: true
        }));
    });
});