//click event for clicking a cell
document.addEventListener('click', function (e) {
    const btn = e.target.closest('button[data-cell]');

    if (!btn) {
        return;
    }

    const cell = JSON.parse(btn.dataset.cell);
    btn.innerHTML = cell.IsBomb ? "Y" : "N";
    console.log("loc of cell on the grid is C" + cell.Column + ", R" + cell.Row);

    cell.IsRevealed = true;
});

//add methods to change innerhtml
//to a flag         (right click)
//to a bomb         (clicked bomb)
//to its number     (clicked non bomb)

//also change cell attr
function flagCell(cell) {
}