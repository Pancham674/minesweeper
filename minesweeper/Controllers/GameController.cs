using Microsoft.AspNetCore.Mvc;

namespace minesweeper.Controllers
{
	public class GameController : Controller
	{
		public static Board _board = new Board();

		public IActionResult Game()
		{
			if (_board.CellCount == 0)
			{
				_board = new Board();
			}
			else
			{   //rearrange cells!!
				_board.InitCells();
			}
			return View(_board);
		}

		public IActionResult LoadBoard()
		{
			return PartialView("../_Board", _board);
		}

		public IActionResult ResetGame(int myColumn, int myRow)
		{
			_board = new Board(myColumn, myRow);
			return PartialView("../_Board", _board);
		}

		public IActionResult CellClicked(int myColumn, int myRow)
		{
			_board.CellClicked(myColumn, myRow);
			//bool isGameWon = _board.IsGameWon(); 

			if (_board.IsGameFinished())
			{
				//return RedirectToAction("RevealBoardView");
			}

			Cell cell = _board.Cells[myColumn, myRow];
			return PartialView("../_Cell", cell);
		}

		public IActionResult FlagCell(int myColumn, int myRow)
		{
			//_board.FlagCell(myColumn, myRow);
			return PartialView("../_Board", _board);
		}

		public IActionResult RevealBoardView()
		{
			//_board.RevealCell(myColumn, myRow);
			return PartialView("../_Board", _board);
		}
	}
}