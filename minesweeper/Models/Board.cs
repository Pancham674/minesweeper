using minesweeper.Models;

public class Board
{
	int _rows;
	int _columns;
	int _bombCount;
	int _cellCount;

	bool _roundStarted;
	int _lifeAmount;
	int _setFlags;

	Random _rand = new Random();

	Cell[,] _cells;
	RoundSummary _summary;

	/// <summary>
	/// Standard constructor, will initialise a _rand size between 5 to 15 coluumns and rows
	/// </summary>
	public Board()
	{
		_rows = _rand.Next(5, 15);
		_columns = _rand.Next(5, 15);
		_cells = new Cell[_columns, _rows];

		_cellCount = _rows * _columns;
		_bombCount = (int)Math.Round(_cellCount / 4f);

		_summary = new RoundSummary();
		_lifeAmount = 1;
		_setFlags = 0;
		InitCells();
	}

	public Board(int myColumns, int myRows)
	{
		_columns = myColumns;
		_rows = myRows;
		_cells = new Cell[_columns, _rows];

		_cellCount = _rows * _columns;
		_bombCount = (int)Math.Round(_cellCount / 4f);

		_summary = new RoundSummary();
		_setFlags = 0;
		InitCells();
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
		{   //select random cells to be bombs, if its not already one
			int randCell = _rand.Next(boardSize - 1);
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
		_roundStarted = true;
		CellClicked(_cells[myColumn, myRow]);
	}

	void CellClicked(Cell myCell)
	{
		if (myCell.IsFlagged)
		{
			return;
		}
		else if (myCell.IsBomb)
		{
			_lifeAmount--;
			//_lifes.textContent = `Lifes: ${ _lifeAmount}`;

			//treat bomb as flag for chording
			myCell.IsFlagged = true;
			myCell.IsExploded = true;

			if (_lifeAmount <= 0)
			{
				RevealBoard(false);
				//changeTitles("Game Over!", ["You lost the game!", "Better luck next time", "Stay determined!"]);
				return;
			}
		}
		else if (myCell.IsRevealed)
		{
			Chord(myCell);
			return;
		}

		myCell.IsRevealed = true;
		//changeBoardProgress(myCell.IsBomb);

		if (myCell.NeighboringBombs == 0)
		{
			UncoverNeighboringCells(myCell);
		}

		if (IsGameFinished())
		{
			//revealBoard(true);
			//changeTitles("Board Finished!", ["Awesome!", "Congrats!!", "Amazing!!!"]);
			return;
		}
	}

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

	void UncoverNeighboringCells(Cell myCell)
	{	//loop around cellModels neigbors
		for (int cCol = myCell.Column - 1; cCol < myCell.Column + 2; cCol++)
		{
			if (cCol < 0 || cCol > _columns - 1)
			{           //dont go out of the board
				continue;
			}

			for (int cRow = myCell.Row - 1; cRow < myCell.Row + 2; cRow++)
			{
				if (cRow < 0 || cRow > _rows - 1)
				{          //dont go out of the board
					continue;
				}

				Cell neighbor = _cells[cCol, cRow];

				//ignore self and uncovered cells
				if (neighbor == myCell || neighbor.IsRevealed)
				{
					continue;
				}

				neighbor.IsRevealed = true;
				//changeBoardProgress();

				//give player their flag back
				if (neighbor.IsFlagged)
				{
					_setFlags--;
					neighbor.IsFlagged = false;
					//_remainingFlags.textContent = `Remaining flags: ${ _bombCount - _setFlags}/${ _bombCount}`;
				}

				//continue uncovering cells that have no bombs as neigbors!!!
				if (neighbor.NeighboringBombs == 0)
				{
					UncoverNeighboringCells(neighbor);
				}
			}
		}

	}

	public void ToggleFlag(int myColumn, int myRow)
	{
		Cell cell = _cells[myColumn, myRow];

		if (cell.IsRevealed)
		{
			return;
		}

		//remove the flag
		if (cell.IsFlagged)
		{
			_setFlags--;
			cell.IsFlagged = false;
		}
		//only add a flag if the amount of set flags is lesser than the amount of bombs
		else if (_setFlags < _bombCount)
		{
			_setFlags++;
			cell.IsFlagged = true;
			//cellView.textContent = "🚩";
		}

		//_remainingFlags.textContent = `Remaining flags: ${ _bombCount - _setFlags}/${ _bombCount}`;
	}

	//muss ins js
	public void RevealBoard(bool myHasWon)
	{
		//_boardView.className = wonGame ? _boardView.className + "won" : _boardView.className;
		//_lossStreakCount = wonGame ? 0 : _lossStreakCount + 1;

		//_boardModel.Cells.forEach((row) => {
		//	row.forEach((myCell) => {
		//		const cellView = _boardViewTableBody.children[myCell.Row].cells[myCell.Column].children[0];

		//		cellView.removeEventListener('click', dispatchLeftClick);
		//		cellView.removeEventListener('contextmenu', dispatchRightClick);
		//		cellView.removeEventListener('mouseenter', dispatchMouseEnter);
		//		cellView.removeEventListener('mouseleave', dispatchMouseLeave);

		//		cellView.oncontextmenu = (e) => { e.preventDefault(); };

		//		//reveal all uncovered bombs
		//		if (myCell.IsExploded)
		//		{
		//			cellView.textContent = "💥";
		//		}
		//		else if (!myCell.IsRevealed && myCell.IsBomb)
		//		{
		//			cellView.textContent = "💣";
		//		}

		//		if (cellView.className.includes("hovering"))
		//		{
		//			cellView.className = cellView.className.substring(0, cellView.className.indexOf("hovering") - 1);
		//		}

		//		cellView.className = wonGame ? cellView.className + " won-game finished" : cellView.className + " finished";
		//	});
		//});
	}

	public bool IsGameFinished()
	{
		if (_lifeAmount <= 0)
		{
			return true;
		}

		bool isFinished = true;
		foreach(Cell cell in _cells)
		{ 
			//ignore bombs since they shouldnt be uncovered to win
			if (cell.IsBomb)
			{
				continue;
			}
			isFinished = cell.IsRevealed ? isFinished : false;
		}

		return isFinished;
	}

	public bool IsGameWon()
	{
		if (!IsGameFinished())
		{
			return false;
		}

		bool isWon = true;			//assume game is won
		foreach (Cell cell in _cells)
		{	//...until we find a revealed bomb
			isWon = cell.IsBomb ?
				cell.IsExploded ? false : isWon :
				isWon;

			if (!isWon)
			{
				break;
			}
		} 

		return isWon;
	}

	public int Rows	{ get => _rows; }
	public int Columns { get => _columns; }
	public int BombCount
	{
		get => _bombCount;
		set => _bombCount = value; 
	}
	public int CellCount { get => _cellCount; }
	public Cell[,] Cells { get => _cells; }
	public RoundSummary Summary { get => _summary; }
}