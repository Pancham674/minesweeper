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

		public string GetCell(int myColumn, int myRow)
		{
			Cell cell = _board.Cells[myColumn, myRow];
			string jsonData = System.Text.Json.JsonSerializer.Serialize(cell);
			return jsonData;
		}

		public void CellChord(int myColumn, int myRow)
		{
			Cell cell = _board.Cells[myColumn, myRow];
			_board.Chord(cell);
		}

		public IActionResult ToggleFlag(int myColumn, int myRow)
		{
			_board.ToggleFlag(myColumn, myRow);
			Cell cell = _board.Cells[myColumn, myRow];
			return PartialView("../_Cell", cell);
		}

		public IActionResult RevealBoardView()
		{
			//_board.RevealCell(myColumn, myRow);
			return PartialView("../_Board", _board);
		}
	}
}