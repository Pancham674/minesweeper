using Microsoft.AspNetCore.Razor.TagHelpers;
using System.Data.Common;

public class Cell
{
	public Cell(int myColumn, int myRow, bool myIsBomb)
	{
		_column = myColumn;
		_row = myRow;
		_isBomb = myIsBomb;

		_isRevealed = false;
		_isFlagged = false;

		_neighbors = new Cell[3][];
	}

	int _row;
	int _column;
	int _neighboringBombs;
	Cell[][] _neighbors;
	
	bool _isRevealed;
	bool _isFlagged;
	bool _isBomb;
	
	HtmlTargetElementAttribute _htmlElement;

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

	//only fields that aren't bombs should have a number
	public int NeighboringBombs
	{
		get => _neighboringBombs;
		set => _neighboringBombs = _isBomb ? -1 : value;
	}

	public HtmlTargetElementAttribute Element
	{
		get => _htmlElement;
		set => _htmlElement = value;
	}

	public Cell[][] Neighbors
	{
		get => _neighbors;
		set => _neighbors = value;
	}
}