public class Cell
{
	int _row;
	int _column;
	int _neighboringBombs;
	
	bool _isRevealed;
	bool _isExploded;
	bool _isFlagged;
	bool _isBomb;	
	
	public Cell(int myColumn, int myRow, bool myIsBomb)
	{
		_column = myColumn;
		_row = myRow;
		_isBomb = myIsBomb;

		_isRevealed = false;
		_isExploded = false;
		_isFlagged = false;

		_neighboringBombs = -1;
	}

	public int Row { get => _row; }
	public int Column { get => _column;	}
	public bool IsBomb { get => _isBomb; }

	public bool IsRevealed 
	{
		get => _isRevealed;
		set => _isRevealed = value; 
	}

	public bool IsFlagged
	{
		get => _isFlagged;
		set => _isFlagged = value;
	}

	/// <summary>
	/// The bomb that the player clicked on.
	/// </summary>
	public bool IsExploded
	{
		get => _isExploded;
		set => _isExploded = value;
	}

	/// <summary>
	/// Is this cells number of bombs that are around it. Will be -1 if the cell itself is a bomb
	/// </summary>
	public int NeighboringBombs
	{
		get => _neighboringBombs;
		
		//only cells that aren't bombs should have a number
		set => _neighboringBombs = _isBomb ? -1 : value;
	}
}