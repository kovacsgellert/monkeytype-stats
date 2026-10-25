namespace MonkeyTypeStats.Api.Data;

public class ProfileSnapshot
{
    public Guid Id { get; set; }
    public DateTime CapturedAt { get; set; }
    public int CompletedTests { get; set; }
    public int StartedTests { get; set; }
    public double TimeTypingSeconds { get; set; }
    public int StreakLength { get; set; }
    public int MaxStreakLength { get; set; }
    public DateTime? LastResultTimestamp { get; set; }
    public int? StreakHourOffset { get; set; }
}
