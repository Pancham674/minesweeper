using minesweeper.Models;

public class Board
{
	int _rows;
	int _columns;
	int _bombCount;
	int _cellCount;

	Random _rand = new Random();

	Cell[][] _cells;
	RoundSummary _summary;

	/// <summary>
	/// Standard constructor, will initialise a _rand size between 5 to 15 coluumns and rows
	/// </summary>
	public Board()
	{
		_rows = _rand.Next(5, 15);
		_columns = _rand.Next(5, 15);
		_cells = new Cell[_columns][];

		_cellCount = _rows * _columns;
		_bombCount = (int)Math.Round(_cellCount / 4f);
		
		_summary = new RoundSummary();
		InitCells();
	}

	public Board(int myColumns, int myRows)
	{
		_columns = myColumns;
		_rows = myRows;
		_cells = new Cell[_columns][];
		
		_cellCount = _rows * _columns;
		_bombCount = (int)Math.Round(_cellCount / 4f);

		_summary = new RoundSummary();
		InitCells();
	}

	public void InitCells()
	{
		Queue<bool> bombList = InitBombList();

		for (int c = 0; c < _columns; c++)
		{
			_cells[c] = new Cell[_rows];
			for (int r = 0; r < _rows; r++)
			{
				_cells[c][r] = new Cell(c, r, bombList.Dequeue());
			}
		}

		SetCellNumber();
	}

	/// <summary>
	/// Assigns all cells their numbers by checking the neigbors around the cell. Also adds a ref of them to cell.Neigbors for chording.
	/// </summary>
	void SetCellNumber()
	{
		foreach(Cell[] column in _cells)
		{
			foreach (Cell currentCell in column)
			{
				//ignore bombs since they shouldnt have numbers
				if (currentCell.IsBomb)
				{
					continue;
				}

				int neighboringBombs = 0;
				int colForNeighbors = 0;

				//will check the rows between the current cell (row-1 = upper cell, row+1 = lower cell)
				for (int c = currentCell.Column - 1; c < currentCell.Column+ 2; c++)
				{
					//prevent going outside of the board index
					if (c < 0 || c > _columns - 1)
					{
						continue;
					}

					int rowForNeighbors = 0;

					//will check the columns beside the current cell (col-1 = left cell, col+1 = right cell)
					for (int r = currentCell.Row- 1; r < currentCell.Row+ 2; r++)
					{
						//prevent going outside of the board index and ignore self
						if (r < 0 || r > _rows - 1 || (c == currentCell.Column && r == currentCell.Row))
						{
							continue;
						}

						neighboringBombs = _cells[c][r].IsBomb ? neighboringBombs + 1 : neighboringBombs;
						rowForNeighbors++;
					}
					colForNeighbors++;
				}

				currentCell.NeighboringBombs = neighboringBombs;
			}
		}
	}

	/// <summary>
	/// Initializes and returns a bool Queue for the board that contains all the position of all bombs and safe cells
	/// </summary>
	/// <returns></returns>
	Queue<bool> InitBombList()
	{
		int tmpBombs = _bombCount;
		int boardSize = _rows * _columns;
		bool[] bombList = new bool[boardSize];

		//after this bombList will have the correct amount of cells randomized to be bombs
		for (int i = 0; i < boardSize; i++)
		{
			int randNumber = _rand.Next(0, 4);

			if (randNumber == 3 && tmpBombs > 0)
			{
				bombList[i] = true;
				tmpBombs--;
			}
			else
			{
				bombList[i] = false;
			}
		}

		//...but it may not have _bombCount amount of bombs, so put in the rest till tmpBombs is 0
		while (tmpBombs > 0)
		{	//select random cells to be bombs, if its not already one
			int randCell = _rand.Next(boardSize - 1);
			if (!bombList[randCell])
			{
				bombList[randCell] = true;
				tmpBombs--;
			}
		}

		return new Queue<bool>(bombList);			//yay
	}

	public int Rows	{ get => _rows; }
	public int Columns { get => _columns; }
	public int BombCount
	{
		get => _bombCount;
		set => _bombCount = value; 
	}
	public int CellCount { get => _cellCount; }
	public Cell[][] Cells { get => _cells; }
	public RoundSummary Summary { get => _summary; }
}