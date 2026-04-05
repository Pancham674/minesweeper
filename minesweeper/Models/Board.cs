using minesweeper.Models;
using System.Text.Json.Serialization;

public class Board
{
	int _rows;
	int _columns;
	int _bombCount;
	int _cellCount;

	bool _hasRoundStarted;
	long _revealedCellsCount;
	
	int _lifeCount;
	int _setFlagCount;
	int _lossStreakCount;
	static int _originalLifeCount;

	Random _randon = new Random();

	Cell[,] _cells;
	RoundSummary _summary;

	/// <summary>
	/// Standard constructor, will initialize a random count between 5 to 15 for colums and rows
	/// </summary>
	public Board()
	{
		_originalLifeCount = 1;
		adjustBoardAttrbutes(_randon.Next(5, 15), _randon.Next(5, 15));
		InitCells();
	}

	/// <summary>
	/// Will initialize a Board with specific columns and rows count
	/// </summary>
	public Board(int myColumns, int myRows)
	{
		adjustBoardAttrbutes(myColumns, myRows);
		InitCells();
	}

	/// <summary>
	/// Will initialize a Board with specific columns, rows and lifes count
	/// </summary>
	public Board(int myColumns, int myRows, int myLifes)
	{
		_originalLifeCount = myLifes;
		adjustBoardAttrbutes(myColumns, myRows);
		InitCells();
	}

	/// <summary>
	/// Sets the cell- and bombCount depending on myColumns and myRows. Initializes an empty summary and calls InitCells() afterwards.
	/// </summary>
	/// <param name="myColumns"></param>
	/// <param name="myRows"></param>
	void adjustBoardAttrbutes(int myColumns, int myRows)
	{
		_columns = myColumns;
		_rows = myRows;
		_cells = new Cell[_columns, _rows];

		_cellCount = _rows * _columns;
		_bombCount = (int)Math.Round(_cellCount / 4f);

		_summary = new RoundSummary();
		ResetUserStats();
		InitCells();
	}

	void ResetUserStats()
	{
		_lifeCount = _originalLifeCount;
		_setFlagCount = 0;
		_revealedCellsCount = 0;
		_hasRoundStarted = false;
	}

	public void InitCells()
	{
		Queue<bool> bombList = InitBombList();

		for (int c = 0; c < _columns; c++)
		{
			for (int r = 0; r < _rows; r++)
			{
				_cells[c, r] = new Cell(c, r, bombList.Dequeue());
			}
		}

		SetCellNumber();
	}

	/// <summary>
	/// Assigns all cells their numbers by checking the neigbors around the myCell. Also adds a ref of them to myCell.Neigbors for chording.
	/// </summary>
	void SetCellNumber()
	{
		foreach (Cell currentCell in _cells)
		{   //ignore bombs since they shouldnt have numbers
			if (currentCell.IsBomb)
			{
				continue;
			}

			int neighboringBombs = 0;

			//will check the rows between the current myCell (row-1 = upper myCell, row+1 = lower myCell)
			for (int c = currentCell.Column - 1; c < currentCell.Column + 2; c++)
			{
				//prevent going outside of the board index
				if (c < 0 || c > _columns - 1)
				{
					continue;
				}


				//will check the columns beside the current myCell (col-1 = left myCell, col+1 = right myCell)
				for (int r = currentCell.Row - 1; r < currentCell.Row + 2; r++)
				{
					//prevent going outside of the board index and ignore self
					if (r < 0 || r > _rows - 1 || (c == currentCell.Column && r == currentCell.Row))
					{
						continue;
					}

					neighboringBombs = _cells[c, r].IsBomb ? neighboringBombs + 1 : neighboringBombs;
				}

				currentCell.NeighboringBombs = neighboringBombs;
			}
		}
	}

	/// <summary>
	/// Initializes and returns a bool Queue for the board that contains all the position of all bombs and safe cells
	/// </summary>
	Queue<bool> InitBombList()
	{
		int tmpBombs = _bombCount;
		int boardSize = _rows * _columns;
		bool[] bombList = new bool[boardSize];

		//after this bombList will have the correct amount of cells randomized to be bombs
		for (int i = 0; i < boardSize; i++)
		{
			int randNumber = _randon.Next(0, 4);

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
		{   //select random cells to be bombs, if its not already one
			int randCell = _randon.Next(boardSize - 1);
			if (!bombList[randCell])
			{
				bombList[randCell] = true;
				tmpBombs--;
			}
		}

		return new Queue<bool>(bombList);           //yay
	}

	public void CellClicked(int myColumn, int myRow)
	{
		_hasRoundStarted = true;
		CellClicked(_cells[myColumn, myRow]);
	}
	
	/// <summary>
	/// Performs different actions based on the attributes of myCell.
	/// </summary>
	void CellClicked(Cell myCell)
	{
		if (myCell.IsFlagged)
		{
			return;
		}
		else if (myCell.IsBomb)
		{
			_lifeCount--;

			//treat bomb as flag for chording
			_setFlagCount++;
			myCell.IsFlagged = true;
			myCell.IsExploded = true;

			if (IsGameFinished())
			{
				RevealBombs();
				return;
			}
			//this will be incremented in a few lines even though it shouldnt be affected when bombs are clicked
			_revealedCellsCount--;			//so a lazy fix
		}
		else if (myCell.IsRevealed)
		{
			Chord(myCell);
			return;
		}

		myCell.IsRevealed = true;
		_revealedCellsCount++;

		if (myCell.NeighboringBombs == 0)
		{
			RevealNeighboringCells(myCell);
		}

		if (IsGameFinished())
		{
			RevealBombs();
			return;
		}
	}

	/// <summary>
	/// Reveals neighbors of myCell if the flags on the neighbors is equal/greater than myCell.NeighboringBombs.
	/// </summary>
	public void Chord(Cell myCell)
	{
		int flaggedNeighbors = 0;
		List<Cell> neighbors = new List<Cell>();

		//loop around cellModels neigbors
		for (int cCol = myCell.Column - 1; cCol < myCell.Column + 2; cCol++)
		{
			if (cCol < 0 || cCol > _columns - 1)
			{   //dont go out of the board
				continue;
			}

			for (int cRow = myCell.Row - 1; cRow < myCell.Row + 2; cRow++)
			{
				if (cRow < 0 || cRow > _rows - 1)
				{   //dont go out of the board
					continue;
				}

				Cell neighbor = _cells[cCol, cRow];

				//ignore self
				if (neighbor == myCell)
				{
					continue;
				}

				flaggedNeighbors = neighbor.IsFlagged ? flaggedNeighbors + 1 : flaggedNeighbors;
				neighbors.Add(neighbor);
			}
		} 
		
		//check if theres an equal or greater amount of flags placed around it
		if (flaggedNeighbors >= myCell.NeighboringBombs)
		{
			foreach (Cell neighbor in neighbors)
			{	//ignore revealed and flagged cells
				if (neighbor.IsRevealed || neighbor.IsFlagged)
				{
					continue;
				}

				//uncover neigbors
				CellClicked(neighbor);
			}
		}
	}

	/// <summary>
	/// Reveal neighbors of myCell if the neighbor itself has no neigboringBombs, aka a 0 cell.
	/// </summary>
	/// <param name="myCell"></param>
	void RevealNeighboringCells(Cell myCell)
	{	//loop around cellModels neigbors
		for (int cCol = myCell.Column - 1; cCol < myCell.Column + 2; cCol++)
		{
			if (cCol < 0 || cCol > _columns - 1)
			{   //dont go out of the board
				continue;
			}

			for (int cRow = myCell.Row - 1; cRow < myCell.Row + 2; cRow++)
			{
				if (cRow < 0 || cRow > _rows - 1)
				{   //dont go out of the board
					continue;
				}

				Cell neighbor = _cells[cCol, cRow];

				//ignore self and uncovered cells
				if (neighbor == myCell || neighbor.IsRevealed)
				{
					continue;
				}

				neighbor.IsRevealed = true;
				_revealedCellsCount++;

				//give player their flag back
				if (neighbor.IsFlagged)
				{
					_setFlagCount--;
					neighbor.IsFlagged = false;
				}

				//continue uncovering cells that have no bombs as neigbors!!!
				if (neighbor.NeighboringBombs == 0)
				{
					RevealNeighboringCells(neighbor);		//i LOVE recursion!!!!!
				}
			}
		}
	}

	/// <summary>
	/// Either adds or sets a flag on a specific cell
	/// </summary>
	/// <param name="myColumn"></param>
	/// <param name="myRow"></param>
	public void ToggleFlag(int myColumn, int myRow)
	{
		Cell cell = _cells[myColumn, myRow];

		if (cell.IsRevealed)
		{
			return;
		}

		if (cell.IsFlagged)                     //remove the flag
		{
			_setFlagCount--;
			cell.IsFlagged = false;
		}
		else if (_setFlagCount < _bombCount)    //only add a flag if the amount of set flags is lesser than the amount of bombs
		{
			_setFlagCount++;
			cell.IsFlagged = true;
		}
	}

	/// <summary>
	/// Iterates through _cells to reveal ALL bombs. Gets called when round's finished.
	/// </summary>
	void RevealBombs()
	{
		foreach(Cell cell in _cells)
		{
			cell.IsRevealed = cell.IsRevealed ? cell.IsRevealed : cell.IsBomb;
		}
	}
	

	/// <summary>
	/// Returns true if the game is finished either by winning or losing.
	/// </summary>
	/// <returns></returns>
	public bool IsGameFinished()
	{
		if (_lifeCount <= 0)
		{
			return true;
		}
		return IsGameWon();
	}

	public bool IsGameWon()
	{
		if (_lifeCount < 0)
		{
			_lossStreakCount++;
			return false;
		}

		//assume player won
		bool isFinished = true;
		foreach (Cell cell in _cells)
		{	//check cells that are not bombs but also not revealed (all non bombs must be revealed required to win)
			if (!cell.IsBomb && !cell.IsRevealed)
			{
				isFinished = false;
				break;
			}
		}
		_lossStreakCount = isFinished ? 0 : _lossStreakCount + 1;
		return isFinished;
	}

	public int Rows	{ get => _rows; }
	public int Columns { get => _columns; }
	public int BombCount
	{
		get => _bombCount;
		set => _bombCount = value; 
	}
	public int CellCount { get => _cellCount; }
	public int SetFlagCount { get => _setFlagCount; }
	public int LifeCount { get => _lifeCount; }
	public long RevealedCellCount { get => _revealedCellsCount; }
	public int LossStreakCount { get => _lossStreakCount; }
	public bool HasRoundStarted { get => _hasRoundStarted; }
	[JsonIgnore]
	public Cell[,] Cells { get => _cells; }
	
	[JsonIgnore]
	public RoundSummary Summary { get => _summary; }
}