export var RoundState;
(function (RoundState) {
    RoundState[RoundState["NotStarted"] = 0] = "NotStarted";
    RoundState[RoundState["Active"] = 1] = "Active";
    RoundState[RoundState["Lost"] = 2] = "Lost";
    RoundState[RoundState["Won"] = 3] = "Won";
})(RoundState || (RoundState = {}));
export class Board {
    constructor(columns, rows, cellsCount, bombsCount, lifeCount, setFlagCount, revealedCellsCount) {
        this.Columns = columns;
        this.Rows = rows;
        this.CellsCount = cellsCount;
        this.BombsCount = bombsCount;
        this.LifeCount = lifeCount;
        this.SetFlagCount = setFlagCount;
        this.RevealedCellsCount = revealedCellsCount;
    }
}
export class Cell {
    constructor(column, row, neighboringBombs, isFlagged, isRevealed, isExploded) {
        this.Column = column;
        this.Row = row;
        this.NeighboringBombs = neighboringBombs;
        this.IsFlagged = isFlagged;
        this.IsRevealed = isRevealed;
        this.IsExploded = isExploded;
    }
}
//# sourceMappingURL=Model.js.map