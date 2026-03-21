using Microsoft.AspNetCore.Mvc;
using minesweeper.Models;
using System.Diagnostics;

namespace minesweeper.Controllers
{
	public class HomeController : Controller
	{
		public static Board _board = new Board();

		public IActionResult Index()
		{
			return View();
		}

		public IActionResult Game()
		{
			if (_board.Cells.Count() == 0)
			{
				_board = new Board();
			}
			else
			{	//rearrange cells!!
				_board.InitCells();
			}
			return View(_board);
		}

		public IActionResult LoadBoard()
		{
			return PartialView("_Board", _board);
		}

		public IActionResult ResetGame(int myColumn, int myRow)
		{
			_board = new Board(myColumn, myRow);
			_board.InitCells();

			return PartialView("_Board", _board);
		}

		public IActionResult Privacy()
		{
			return View();
		}

		[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
		public IActionResult Error()
		{
			return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
		}
	}
}
