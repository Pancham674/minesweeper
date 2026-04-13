export enum RoundState {
    NotStarted,
    Active,
    Lost,
    Won
}

export class Board {
    Columns: number;
    Rows: number;
    CellsCount: number;
    BombsCount: number;

    constructor(columns: number, rows: number, cellsCount: number, bombsCount: number) { 
        this.Columns = columns;
        this.Rows = rows;
        this.CellsCount = cellsCount;
        this.BombsCount = bombsCount;
    }
}

export class Cell {
    Column: number;
    Row: number;
    NeighboringBombs: number;
    IsFlagged: boolean;
    IsRevealed: boolean;
    IsExploded: boolean;

    constructor(column: number, row: number, neighboringBombs: number, isFlagged: boolean, isRevealed: boolean, isExploded: boolean) {
        this.Column = column;
        this.Row = row;
        this.NeighboringBombs = neighboringBombs;
        this.IsFlagged = isFlagged;
        this.IsRevealed = isRevealed;
        this.IsExploded = isExploded;
    }
}