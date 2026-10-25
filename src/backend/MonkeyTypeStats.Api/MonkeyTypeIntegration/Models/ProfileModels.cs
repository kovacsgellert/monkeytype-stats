using System.Text.Json.Serialization;

namespace MonkeyTypeStats.Api.MonkeyTypeIntegration.Models;

public record UserStatsData
{
    public int CompletedTests { get; set; }
    public int StartedTests { get; set; }
    public double TimeTyping { get; set; }
}

public record StreakData
{
    public long? LastResultTimestamp { get; set; }
    public int Length { get; set; }
    public int MaxLength { get; set; }
    public int? HourOffset { get; set; }
}

public record TagData
{
    [JsonPropertyName("_id")]
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

public record PersonalBestData
{
    public double Wpm { get; set; }
    public double? Raw { get; set; }
    public double? Acc { get; set; }
    public double? Consistency { get; set; }
    public string? Difficulty { get; set; }
    public string? Language { get; set; }
    public bool? Punctuation { get; set; }
    public bool? Numbers { get; set; }
    public bool? LazyMode { get; set; }
    public long Timestamp { get; set; }
}

public record LeaderboardRankData
{
    public int? Rank { get; set; }
    public int? FriendsRank { get; set; }
    public double? Wpm { get; set; }
    public double? Raw { get; set; }
    public double? Acc { get; set; }
    public double? Consistency { get; set; }
    public long? Timestamp { get; set; }
}

public record LeaderboardData
{
    public int Count { get; set; }
}
