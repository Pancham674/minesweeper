using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace minesweeper.Controllers
{
	public class GameController : Controller
	{
		public static Board _board = new Board();

		/// <summary>
		/// Gets called whenever the link in Index/Welcome page or "Game" in navigation gets clicked.
		/// </summary>
		/// <returns>A Partial BoardView with a random size.</returns>
		public IActionResult Start()
		{ 
			_board.InitCells();
			_board.ResetUserStats();
			_board.LossStreakCount = 0;
			return View("Game", _board);
		}

		public IActionResult ResetGame(int myColumn, int myRow)
		{
			_board = new Board(myColumn, myRow);
			return PartialView("../_Board", _board);
		}

		public IActionResult ResetGameAndChangeLifes(int myColumn, int myRow, int myLifes)
		{
			_board = new Board(myColumn, myRow, myLifes);
			return PartialView("../_Board", _board);
		}

		/// <summary>
		/// Gets called whenever the document is ready, i guess
		/// </summary>
		/// <returns>Returns a partial view that displays the current boardView.</returns>
		public IActionResult GetBoardView()
		{
			return PartialView("../_Board", _board);
		}

		/// <summary>
		/// Gets called whenever the client needs the model with current data.
		/// </summary>
		/// <returns>The BoardModel, which was serialized into a Json Object</returns>
		public string GetBoardModel()
		{
			return JsonSerializer.Serialize(_board);
		}

		public IActionResult GetCellView(int myColumn, int myRow)
		{
			return PartialView("../_Cell", _board.Cells[myColumn, myRow]);
		}

		public string GetBombs()
		{
			return JsonSerializer.Serialize(_board.GetBombs());
		}

		public string CellClicked(int myColumn, int myRow)
		{
			return JsonSerializer.Serialize(_board.CellClicked(myColumn, myRow));
		}

		public bool ToggleFlag(int myColumn, int myRow)
		{
			return _board.ToggleFlag(myColumn, myRow);
		}

		public int GetSetFlagCount()
		{
			return _board.SetFlagCount;
		}

		public int GetLossStreakCount()
		{
			return _board.LossStreakCount;
		}

		public bool GetIsRoundLost()
		{
			return _board.IsRoundLost();
		}

		public bool GetIsRoundWon()
		{
			return _board.IsRoundWon();
		}

		public bool GetHasRoundStarted()
		{
			return _board.HasRoundStarted;
		}
	}
}