namespace MonkeyTypeStats.Api.Features.Profile;

public static class LeaderboardMath
{
    // e.g. rank 148,379 of 528,594 => 28.07 (top 28.07%)
    public static double? TopPercent(int? rank, int? leaderboardSize) =>
        rank is null || leaderboardSize is null or 0
            ? null
            : Math.Round((double)rank.Value / leaderboardSize.Value * 100, 2);
}
