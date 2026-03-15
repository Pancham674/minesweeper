using static System.Runtime.InteropServices.JavaScript.JSType;

public class Board
{
	int _rows;
	int _columns;
	int _bombCount;

	int _lives;


	Cell[][] _cells;

	public Board()
	{
		Random rand = new Random();
		_rows = rand.Next(5, 15);
		_columns = rand.Next(5, 15);
		_cells = new Cell[_columns][];
		_bombCount = (int)Math.Round(_rows * _columns / 4f);

		InitCells();
	}

	public Board(int myRows, int myColumns)
	{
		_rows = myRows;
		_columns = myColumns;
		_cells = new Cell[_columns][];
		_bombCount = (int)Math.Round(_rows * _columns / 4f);
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
					//createFieldElement(currentCell);
					continue;
				}

				int neighboringBombs = 0;
				int colForNeighbors = 0;

				//will check the rows between the current field (row-1 = upper field, row+1 = lower field)
				for (int c = currentCell.Column - 1; c < currentCell.Column+ 2; c++)
				{
					//prevent going outside of the board index
					if (c < 0 || c > _columns - 1)
					{
						continue;
					}

					currentCell.Neighbors[colForNeighbors] = new Cell[3];
					int rowForNeighbors = 0;

					//will check the columns beside the current field (col-1 = left field, col+1 = right field)
					for (int r = currentCell.Row- 1; r < currentCell.Row+ 2; r++)
					{
						//prevent going outside of the board index and ignore self
						if (r < 0 || r > _rows - 1 || (c == currentCell.Column && r == currentCell.Row))
						{
							continue;
						}

						Cell neighbor = _cells[c][r];
						currentCell.Neighbors[colForNeighbors][rowForNeighbors] = neighbor;
						neighboringBombs = neighbor.IsBomb ? neighboringBombs + 1 : neighboringBombs;
						rowForNeighbors++;
					}
					colForNeighbors++;
				}

				currentCell.NeighboringBombs = neighboringBombs;
				//createFieldElement(currentCell);
			}
		}
	}

	/// <summary>
	/// Initializes a Queue for the board that contains all the position of all bombs and safe fields
	/// </summary>
	/// <returns></returns>
	Queue<bool> InitBombList()
	{
		int tmpBombs = _bombCount;
		int boardSize = _rows * _columns;
		bool[] bombList = new bool[boardSize];
		Random random = new Random();

		//set the correct amount of bombs within the boardSize
		for (int i = 0; i < boardSize; i++)
		{
			int rand = random.Next(0, 4);

			if (rand == 3 && tmpBombs > 0)
			{
				bombList[i] = true;
				tmpBombs--;
			}
			else
			{
				bombList[i] = false;
			}
		}

		//put in the rest of the bombs if tmpBombs isnt 0
		while (tmpBombs > 0)
		{	//select random fields to be bombs, if its not already one
			int randomField = random.Next(boardSize - 1);
			if (!bombList[randomField])
			{
				bombList[randomField] = true;
				tmpBombs--;
			}
		}

		return new Queue<bool>(bombList);
	}

	public int Rows
	{
		get => _rows; 
		set => _rows = value; 
	}

	public int Columns
	{
		get => _columns;
		set => _columns = value;
	}

	public int BombCount
	{
		get => _bombCount;
		set => _bombCount = value; 
	}

	public Cell[][] Cells
	{
		get => _cells;
	}
}