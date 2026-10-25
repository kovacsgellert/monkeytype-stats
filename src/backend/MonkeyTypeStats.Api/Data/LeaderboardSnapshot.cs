namespace MonkeyTypeStats.Api.Data;

public class LeaderboardSnapshot
{
    public Guid Id { get; set; }
    public DateTime CapturedAt { get; set; }
    public string Language { get; set; } = string.Empty;
    public string Mode { get; set; } = string.Empty;
    public string Mode2 { get; set; } = string.Empty;
    public int? Rank { get; set; }
    public int? FriendsRank { get; set; }
    public int? LeaderboardSize { get; set; }
    public double? Wpm { get; set; }
    public double? Raw { get; set; }
    public double? Acc { get; set; }
    public double? Consistency { get; set; }
    public DateTime? EntryTimestamp { get; set; }
}
