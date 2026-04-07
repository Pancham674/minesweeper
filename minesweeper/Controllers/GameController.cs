using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace minesweeper.Controllers
{
	public class GameController : Controller
	{
		static Board? _board;

		/// <summary>
		/// Gets called whenever the link in Index/Welcome page or "Game" in navigation gets clicked.
		/// </summary>
		/// <returns>A Partial BoardView with a random size.</returns>
		public IActionResult Start()
		{
			_board = new Board();
			//_board.InitializeCells();
			//_board.ResetUserStats();
			_board.LossStreakCount = 0;
			return View("Game", _board);
		}

		/// <summary>
		/// Resets the round with a given size.
		/// </summary>
		/// <returns>A partial view for the current board with a specific.</returns>
		public IActionResult ResetRound(int myColumn, int myRow)
		{
			_board = new Board(myColumn, myRow);
			return PartialView("../_Board", _board);
		}

		/// <summary>
		/// Resets the Round and sets a  given size and life amount.
		/// </summary>
		/// <returns>A partial view for the current board with a specific size and life amount.</returns>
		public IActionResult ResetRoundAndSetLifes(int myColumn, int myRow, int myLifes)
		{
			_board = new Board(myColumn, myRow, myLifes);
			return PartialView("../_Board", _board);
		}

		/// <summary>
		/// Gets called whenever the document is ready and the round is finished.
		/// </summary>
		/// <returns>A partial view for the current board.</returns>
		public IActionResult GetBoardView()
		{
			return PartialView("../_Board", _board);
		}

		/// <summary>
		/// Gets called whenever the client needs the model with current data.
		/// </summary>
		/// <returns>A string that contains the current BoardModel as a serialized JSON Object</returns>
		public string GetBoardModel()
		{
			return JsonSerializer.Serialize(_board);
		}

		/// <summary>
		/// Gets a specific cell according to the column and row.
		/// </summary>
		/// <returns>A partial view for a specific cell</returns>
		public IActionResult GetCellView(int myColumn, int myRow)
		{
			return PartialView("../_Cell", _board!.Cells[myColumn, myRow]);
		}

		/// <summary>
		/// Performs a click on a specific cell.
		/// </summary>
		/// <returns>A list of cells, that were affected by this click, serialized into a JSON object.</returns>
		public string CellClicked(int myColumn, int myRow)
		{
			return JsonSerializer.Serialize(_board!.CellClicked(myColumn, myRow));
		}

		/// <summary>
		/// Toggles a flag on a specific cell.
		/// </summary>
		/// <returns>A bool specifiyng whether or not the cell was toggled.True if it got toggled, otherwise false.</returns>
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

		public bool GetIsRoundLost()
		{
			return _board!.IsRoundLost();
		}

		public bool GetIsRoundWon()
		{
			return _board!.IsRoundWon();
		}

		public bool IsRoundActive()
		{
			return _board!.IsRoundActive;
		}
	}
}