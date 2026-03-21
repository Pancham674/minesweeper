using Microsoft.AspNetCore.Mvc;

namespace minesweeper.Controllers
{
	public class GameController : Controller
	{
		public static Board _board = new Board();

		public IActionResult Index()
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
			_board.InitCells();

			return PartialView("../_Board", _board);
		}
	}
}