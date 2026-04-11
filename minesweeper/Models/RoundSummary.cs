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

		/// <summary>
		/// Empty Constructor
		/// </summary>
		public RoundSummary() { }

		//unused for now
		//public RoundSummary(bool myWasWon, long myTotalClicks, long myTotalFlagsUsed, long myTotalChordsUsed, long myTotalLivesUsed, long myTotalHintsUsed, TimeSpan myDuration)
		//{
		//	_wasWon = myWasWon;
		//	_totalClicks = myTotalClicks;
		//	_totalFlagsUsed = myTotalFlagsUsed;
		//	_totalChordsUsed = myTotalChordsUsed;
		//	_totalLivesUsed = myTotalLivesUsed;
		//	_totalHintsUsed = myTotalHintsUsed;
		//	_duration = myDuration;
		//}

		public bool WasWon
		{ 
			get => _wasWon;
			set => _wasWon = value; 
		}
		
		public long TotalClicks
		{
			get => _totalClicks;
			set => _totalClicks = value;
		}
		
		public long TotalFlagsUsed
		{
			get => _totalFlagsUsed;
			set => _totalFlagsUsed = value;
		}
		
		public long TotalChordsUsed
		{
			get => _totalChordsUsed;
			set => _totalChordsUsed = value;
		}
		
		public long TotalLivesUsed
		{
			get => _totalLivesUsed;
			set => _totalLivesUsed = value;
		}

		public long TotalHintsUsed
		{
			get => _totalHintsUsed;
			set => _totalHintsUsed = value;
		}
		public TimeSpan Duration
		{
			get => _duration;
			set => _duration = value;
		}
	}
}