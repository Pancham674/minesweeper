using minesweeper.Models;
using System.Diagnostics;
using System.Text.Json.Serialization;

public class Board
{
	int _rows;
	int _columns;
	int _bombsCount;					//todo: create difficulty level instead of doing cellCount / 4
	long _revealedCellsCount;
	
	int _lifeCount;
	int _setFlagCount;

	Cell[,] _cells = new Cell[0, 0];
	RoundSummary? _summary;

	static int _cellsCount;
	static bool _isRoundActive;			//todo: replace this with enum containing these active states: running, not started, won, lost, paused. Will replace methods IsRoundLost and -Won

	static int _lossStreakCount;
	static int _originalLifeCount;
	static Random _random = new Random();

	/// <summary>
	/// Standard constructor, will initialize a random count between 5 to 15 for colums and rows
	/// </summary>
	public Board()
	{
		_originalLifeCount = 1;
		AdjustBoardAttributes(_random.Next(5, 15), _random.Next(5, 15));
	}

	/// <summary>
	/// Will initialize a Board with specific columns and rows count
	/// </summary>
	public Board(int myColumns, int myRows)
	{
		AdjustBoardAttributes(myColumns, myRows);
	}

	/// <summary>
	/// Will initialize a Board with specific columns, rows and lifes count
	/// </summary>
	public Board(int myColumns, int myRows, int myLifes)
	{
		_originalLifeCount = myLifes;
		AdjustBoardAttributes(myColumns, myRows);
	}

	/// <summary>
	/// Sets the cell- and bombsCount depending on myColumns and myRows. Initializes an empty summary and calls InitializeCells() afterwards.
	/// </summary>
	/// <param name="myColumns"></param>
	/// <param name="myRows"></param>
	void AdjustBoardAttributes(int myColumns, int myRows)
	{
		_columns = myColumns;
		_rows = myRows;
		_cells = new Cell[_columns, _rows];

		_cellsCount = _rows * _columns;
		_bombsCount = (int)Math.Round(_cellsCount / 4f);

		_summary = new RoundSummary();
		InitializeCells();
		ResetUserStats();
	}

	public void ResetUserStats()
	{
		_setFlagCount = 0;
		_revealedCellsCount = 0;
		_isRoundActive = false;
		_lifeCount = _originalLifeCount;
	}

	/// <summary>
	/// Initializes all cells with its location on the board and whether or not its a bomb, calls SetCellNumber afterwards.
	/// </summary>
	void InitializeCells()
	{
		int tmpBombs = _bombsCount;
		bool[,] bombsLoc = new bool[_columns, _rows];

		while (tmpBombs > 0)
		{   //select random cells within columns and rows to be bombs
			int randCol = _random.Next(_columns);
			int randRow = _random.Next(_rows);

			bool wasPreviouslyBomb = bombsLoc[randCol, randRow];
			bombsLoc[randCol, randRow] = true; ;

			//if the location is a bomb now and it wasnt previously, then a new bomb was set
			if (bombsLoc[randCol, randRow] && !wasPreviouslyBomb) { tmpBombs--; }
		}

		int currentBombsCount = 0;				//made to check if the board has the expected amount in the end
		for (int c = 0; c < _columns; c++) {
			for (int r = 0; r < _rows; r++)
			{
				_cells[c, r] = new Cell(c, r, bombsLoc[c, r]);
				currentBombsCount = _cells[c, r].IsBomb ? currentBombsCount + 1 : currentBombsCount;
			}
		}
		
		if (currentBombsCount != _bombsCount)
		{
			Debug.Assert(!(currentBombsCount > _bombsCount), "There are MORE bombs than expected...");
			Debug.Assert(!(currentBombsCount < _bombsCount), "There are LESS bombs than expected...");
		}
		SetCellNumber();
	}

	/// <summary>
	/// Assigns all cells their numbers by checking the neigbors around it.
	/// </summary>
	void SetCellNumber()
	{
		foreach (Cell currentCell in _cells)
		{   //ignore bombs since they shouldnt have numbers
			if (currentCell.IsBomb) { continue; }

			int neighboringBombs = 0;

			//will check the rows between the current myCell (row-1 = upper myCell, row+1 = lower myCell)
			for (int c = currentCell.Column - 1; c < currentCell.Column + 2; c++)
			{	//prevent going outside of the board index
				if (c < 0 || c > _columns - 1) { continue; }

				//will check the columns beside the current myCell (col-1 = left myCell, col+1 = right myCell)
				for (int r = currentCell.Row - 1; r < currentCell.Row + 2; r++)
				{   //prevent going outside of the board index and ignore self
					if (r < 0 || r > _rows - 1 || (c == currentCell.Column && r == currentCell.Row)) { continue; }

					neighboringBombs = _cells[c, r].IsBomb ? neighboringBombs + 1 : neighboringBombs;
				}

				currentCell.NeighboringBombs = neighboringBombs;
			}
		}
	}

	public List<Cell> CellClicked(int myColumn, int myRow)
	{
		_isRoundActive = true;
		List<Cell> affectedCells = new List<Cell>();
		CellClicked(_cells[myColumn, myRow], ref affectedCells);
		return affectedCells;
	}

	/// <summary>
	/// Performs different actions based on the attributes of myCell.
	/// </summary>
	/// <param name="myAffectedCells">If a cell gets revealed then itll be added to this list to be shown in the View later.</param>
	void CellClicked(Cell myCell, ref List<Cell> myAffectedCells)
	{
		if (myCell.IsFlagged) { return; }
		else if (myCell.IsBomb)
		{
			_lifeCount--;

			//treat bomb as flag for chording
			_setFlagCount++;
			myCell.IsFlagged = true;
			myCell.IsExploded = true;

			if (IsRoundLost())
			{
				_lossStreakCount++;
				RevealBombs();
				return;
			}
		}
		else if (myCell.IsRevealed)
		{
			Chord(myCell, ref myAffectedCells);
			return;
		}

		myCell.IsRevealed = true;
		myAffectedCells.Add(myCell);
		_revealedCellsCount = myCell.IsBomb ? _revealedCellsCount : _revealedCellsCount + 1;

		if (myCell.NeighboringBombs == 0)
		{
			RevealCellsWithNoBombsAround(myCell, ref myAffectedCells);
		}

		if (IsRoundWon())
		{
			_lossStreakCount = 0;
			RevealBombs();
			return;
		}
	}

	/// <summary>
	/// Reveals neighbors of myCell if the flags on the neighbors is equal/greater than myCell.NeighboringBombs.
	/// </summary>
	public void Chord(Cell myCell, ref List<Cell> myAffectedCells)
	{
		int flaggedNeighbors = 0;
		List<Cell> neighbors = new List<Cell>();

		//loop around cellModels neigbors
		for (int cCol = myCell.Column - 1; cCol < myCell.Column + 2; cCol++)
		{   //dont go out of the board
			if (cCol < 0 || cCol > _columns - 1) { continue; }

			for (int cRow = myCell.Row - 1; cRow < myCell.Row + 2; cRow++)
			{   //dont go out of the board
				if (cRow < 0 || cRow > _rows - 1) { continue; }

				Cell neighbor = _cells[cCol, cRow];

				//ignore self
				if (neighbor == myCell) { continue; }

				flaggedNeighbors = neighbor.IsFlagged ? flaggedNeighbors + 1 : flaggedNeighbors;
				neighbors.Add(neighbor);
			}
		} 
		
		//check if theres an equal or greater amount of flags placed around it
		if (flaggedNeighbors >= myCell.NeighboringBombs)
		{
			foreach (Cell neighbor in neighbors)
			{	//ignore revealed and flagged cells
				if (neighbor.IsRevealed || neighbor.IsFlagged) { continue; }

				//uncover neigbors
				CellClicked(neighbor, ref myAffectedCells);
			}
		}
	}

	/// <summary>
	/// Reveal neighbors of myCell if the neighbor itself has no neigboringBombs, aka a 0 cell.
	/// </summary>
	/// <param name="myCell">The cell with no bombs as neighbors</param>
	void RevealCellsWithNoBombsAround(Cell myCell, ref List<Cell> myAffectedCells)
	{	//loop around cellModels neigbors
		for (int cCol = myCell.Column - 1; cCol < myCell.Column + 2; cCol++)
		{   //dont go out of the board
			if (cCol < 0 || cCol > _columns - 1) { continue; }

			for (int cRow = myCell.Row - 1; cRow < myCell.Row + 2; cRow++)
			{   //dont go out of the board
				if (cRow < 0 || cRow > _rows - 1) { continue; }

				Cell neighbor = _cells[cCol, cRow];

				//ignore self and revealed cells
				if (neighbor == myCell || neighbor.IsRevealed) { continue; }

				neighbor.IsRevealed = true;
				_revealedCellsCount++;

				if (!myAffectedCells.Contains(neighbor)) { myAffectedCells.Add(neighbor); }

				//give player their flag back
				if (neighbor.IsFlagged)
				{
					_setFlagCount--;
					neighbor.IsFlagged = false;
				}

				//continue revealing cells that have no bombs as neigbors!!!
				if (neighbor.NeighboringBombs == 0) { RevealCellsWithNoBombsAround(neighbor, ref myAffectedCells); }
			}
		}
	}

	/// <summary>
	/// Either adds or sets a flag on a specific cell.
	/// </summary>
	/// <returns>True, if the flag was toggled, otherwise false, meaning that nothing happened.</returns>
	public bool ToggleFlag(int myColumn, int myRow)
	{
		Cell cell = _cells[myColumn, myRow];

		if (cell.IsRevealed) { return false; }	//dont toggle on revealed cells

		if (cell.IsFlagged)                     //remove the flag
		{
			_setFlagCount--;
			cell.IsFlagged = false;
		}
		else if (_setFlagCount < _bombsCount)    //only add a flag if the amount of set flags is lesser than the amount of bombs
		{
			_setFlagCount++;
			cell.IsFlagged = true;
		}
		else { return false; }
		return true;
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
	
	/// <returns>True, if the round has been lost, otherwise false, meaning that its won or still running.</returns>
	public bool IsRoundLost()
	{
		if (LifeCount <= 0)
		{
			_isRoundActive = false;
			return true;
		}

		return false;
	}

	/// <returns>True, if the round has been won, otherwise false, meaning that its lost or still running.</returns>
	public bool IsRoundWon()
	{	//assume player won
		bool isWon = true;
		foreach (Cell cell in _cells)
		{	//until theres a cell that isnt a bomb and isnt revealed (all non bombs must be revealed to win)
			if (!cell.IsBomb && !cell.IsRevealed)
			{
				isWon = false;
				break;
			}
		}

		_isRoundActive = !isWon;
		return isWon;
	}

	public int Rows	{ get => _rows; }
	public int Columns { get => _columns; }

	public int CellsCount { get => _cellsCount; }
	public int SetFlagCount { get => _setFlagCount; }
	public int LifeCount { get => _lifeCount; }
	/// <summary>
	/// Shows us how many non bombs there are
	/// </summary>
	public long RevealedCellsCount { get => _revealedCellsCount; }
	public bool IsRoundActive { get => _isRoundActive; }
	public int BombsCount
{
		get => _bombsCount;
		set => _bombsCount = value; 
	}
	public int LossStreakCount 
	{ 
		get => _lossStreakCount;
		set => _lossStreakCount = value;
	}
	
	[JsonIgnore]
	public Cell[,] Cells { get => _cells; }
	
	[JsonIgnore]
	public RoundSummary Summary { get => _summary!; }
}