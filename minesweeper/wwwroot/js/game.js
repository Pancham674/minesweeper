const boardHtml = document.getElementById('board');
const boardModel = JSON.parse(boardHtml.dataset.board);

boardHtml.addEventListener('onCellLeftClick', e => {
    const { cellModel, cellHtml } = e.detail;
    console.log("Cell got left clicked.\nloc of cell is C" + cellModel.Column + ", R" + cellModel.Row);
});

boardHtml.addEventListener('onCellRightClick', e => {
    const { cellModel, cellHtml } = e.detail;
    console.log("Cell got right clicked.\nloc of cell is C" + cellModel.Column + ", R" + cellModel.Row);
});

boardHtml.addEventListener('onCellHover', e => {
    const { cellModel, cellHtml } = e.detail;
    console.log("Mouse hovers on Cell.\nloc of cell is C" + cellModel.Column + ", R" + cellModel.Row);
});

boardHtml.addEventListener('onCellHoverEnded', e => {
    const { cellModel, cellHtml } = e.detail;
    console.log("Mouse no longer hovers on Cell.\nloc of cell is C" + cellModel.Column + ", R" + cellModel.Row);
});

