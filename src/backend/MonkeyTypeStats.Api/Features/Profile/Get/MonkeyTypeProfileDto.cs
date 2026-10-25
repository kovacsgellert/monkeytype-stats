namespace MonkeyTypeStats.Api.Features.Profile.Get;

public record MonkeyTypeProfileDto(
    ProfileSnapshotDto? Profile,
    List<LeaderboardStandingDto> Leaderboards,
    List<PersonalBestDto> PersonalBests,
    List<TagDto> Tags
);

public record ProfileSnapshotDto(
    DateTime CapturedAt,
    int CompletedTests,
    int StartedTests,
    double TimeTypingSeconds,
    int StreakLength,
    int MaxStreakLength,
    DateTime? LastResultTimestamp,
    int? StreakHourOffset
);

public record LeaderboardStandingDto(
    string Language,
    string Mode,
    string Mode2,
    DateTime CapturedAt,
    int? Rank,
    int? FriendsRank,
    int? LeaderboardSize,
    double? TopPercent,
    double? Wpm,
    double? Raw,
    double? Acc,
    double? Consistency,
    DateTime? EntryTimestamp,
    Dictionary<string, int>? SpeedHistogram,
    DateTime? SpeedHistogramCapturedAt
);

public record PersonalBestDto(
    string Mode,
    string Mode2,
    string? Language,
    string? Difficulty,
    bool? Punctuation,
    bool? Numbers,
    bool? LazyMode,
    double Wpm,
    double? Raw,
    double? Acc,
    double? Consistency,
    DateTime Timestamp
);

public record TagDto(string Id, string Name);
