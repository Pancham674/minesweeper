using Microsoft.AspNetCore.Mvc;

namespace minesweeper.Controllers
{
	public class GameController : Controller
	{
		public static Board _board = new Board();

		public IActionResult Start()
		{	//rearrange cells!!
			_board.InitCells();
			return View("Game", _board);
		}

		public IActionResult GetBoard()
		{
			return PartialView("../_Board", _board);
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

		public void CellClicked(int myColumn, int myRow)
		{
			_board.CellClicked(myColumn, myRow);
		}

		public IActionResult ToggleFlag(int myColumn, int myRow)
		{
			_board.ToggleFlag(myColumn, myRow);
			Cell cell = _board.Cells[myColumn, myRow];
			return PartialView("../_Cell", cell);
		}

		public int GetSetFlagCount()
		{
			return _board.SetFlagCount;
		}

		public bool GetIsFinished()
		{
			return _board.IsGameFinished();
		}

		public bool GetIsWon()
		{
			return _board.IsGameWon();
		}
	}
}