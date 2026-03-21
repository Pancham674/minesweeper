using Microsoft.AspNetCore.Mvc;

namespace minesweeper.Controllers
{
	public class SettingsController : Controller
	{
		public IActionResult Settings()
		{
			return View();
		}
	}
}
