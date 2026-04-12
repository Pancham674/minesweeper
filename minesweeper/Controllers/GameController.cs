using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace minesweeper.Controllers
{
	public class GameController : Controller
	{
		static Board? _board;

		/// <summary>
		/// Gets called whenever the page gets reloaded.
		/// </summary>
		/// <returns>A View of Game with a random size, if the board hasn't been initialized yet. Otherwise it'll use it's previous size.</returns>
		public IActionResult Start()
		{
			if (_board == null || _board.CellsCount == 0)
			{
				_board = new Board();
			}
			else	//rearrange cells!!
			{
				_board = new Board(_board!.Columns, _board.Rows);
			}

			_board!.LossStreakCount = 0;
			return View("Game", _board);
		}

		/// <summary>
		/// Resets the round with a given size.
		/// </summary>
		/// <returns>A PartialView of the board with a new size.</returns>
		public IActionResult ResetRound(int myColumn, int myRow)
		{
			_board = new Board(myColumn, myRow);
			return PartialView("../_Board", _board);
		}

		/// <summary>
		/// Resets the round with a given size and life amount.
		/// </summary>
		/// <returns>A PartialView of the board with a new size and life amount.</returns>
		public IActionResult ResetRoundAndSetLifes(int myColumn, int myRow, int myLifes)
		{
			_board = new Board(myColumn, myRow, myLifes);
			return PartialView("../_Board", _board);
		}

		/// <summary>
		/// Gets called whenever the document is ready or the round is finished.
		/// </summary>
		/// <returns>A PartialView of the board.</returns>
		public IActionResult GetBoardView()
		{
			return PartialView("../_Board", _board);
		}

		/// <summary>
		/// Gets called whenever the client needs the board model with its current data.
		/// </summary>
		/// <returns>A string that contains the model of board as a serialized JSON object</returns>
		public string GetBoardModel()
		{
			return JsonSerializer.Serialize(_board);
		}

		/// <summary>
		/// Gets a specific cell according to the given column and row.
		/// </summary>
		/// <returns>A PartialView of a cell with the given column and row</returns>
		public IActionResult GetCellView(int myColumn, int myRow)
		{
			return PartialView("../_Cell", _board!.Cells[myColumn, myRow]);
		}

		/// <summary>
		/// Performs a click on a cell with the given column and row.
		/// </summary>
		/// <returns>A string containing a list of cells, that were affected by this click, serialized into a JSON object.</returns>
		public string CellClicked(int myColumn, int myRow)
		{
			return JsonSerializer.Serialize(_board!.CellClicked(myColumn, myRow));
		}

		/// <summary>
		/// Toggles a flag on a cell with the given column and row.
		/// </summary>
		/// <returns>A bool specifiyng whether or not the cell was toggled. False if nothing happened, otherwise true.</returns>
		public bool ToggleFlag(int myColumn, int myRow)
		{
			return _board!.ToggleFlag(myColumn, myRow);
		}

		/// <returns>The amount of used flags.</returns>
		public int GetSetFlagCount()
		{
			return _board!.SetFlagCount;
		}

		public int GetLossStreakCount()
		{
			return _board!.LossStreakCount;
		}

		/// <returns>The current state of the board as a string</returns>
		public Board.RoundState GetCurrentState()
		{
			return _board!.CurrentState;
		}
	}
}