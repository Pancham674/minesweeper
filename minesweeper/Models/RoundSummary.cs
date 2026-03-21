namespace minesweeper.Models
{
	public class RoundSummary
	{
		bool _wasWon;
		long _totalClicks;
		long _totalFlagsUsed;
		long _totalChordsUsed;
		long _totalLivesUsed;
		long _totalHintsUsed;
		TimeSpan _duration;

		public RoundSummary(bool myWasWon, long myTotalClicks, long myTotalFlagsUsed, long myTotalChordsUsed, long myTotalLivesUsed, long myTotalHintsUsed, TimeSpan myDuration)
		{
			_wasWon = myWasWon;
			_totalClicks = myTotalClicks;
			_totalFlagsUsed = myTotalFlagsUsed;
			_totalChordsUsed = myTotalChordsUsed;
			_totalLivesUsed = myTotalLivesUsed;
			_totalHintsUsed = myTotalHintsUsed;
			_duration = myDuration;
		}

		public bool WasWon { get => _wasWon; }
		public long TotalClicks { get => _totalClicks; }
		public long TotalFlagsUsed { get => _totalFlagsUsed; }
		public long TotalChordsUsed { get => _totalChordsUsed; }
		public long TotalLivesUsed { get => _totalLivesUsed; }
		public long TotalHintsUsed { get => _totalHintsUsed; }
		public TimeSpan Duration { get => _duration; }
	}
}
