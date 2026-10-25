namespace MonkeyTypeStats.Api.Features.Profile.GetLeaderboardHistory;

public record LeaderboardHistoryPointDto(
    DateTime CapturedAt,
    int? Rank,
    int? LeaderboardSize,
    double? TopPercent,
    double? Wpm
);
