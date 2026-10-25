using MonkeyTypeStats.Api.Data;

namespace MonkeyTypeStats.Api.Features.Backup.Common;

public sealed class BackupSnapshot
{
    public string AppVersion { get; set; } = "0.0.0";
    public List<Result> Results { get; set; } = [];
    public List<ResultDetail> ResultDetails { get; set; } = [];
    public List<MonkeyTypeApiResponseLog> MonkeyTypeApiResponseLog { get; set; } = [];
    public List<ProfileSnapshot> ProfileSnapshots { get; set; } = [];
    public List<LeaderboardSnapshot> LeaderboardSnapshots { get; set; } = [];
    public List<SpeedHistogramSnapshot> SpeedHistogramSnapshots { get; set; } = [];
    public List<PersonalBest> PersonalBests { get; set; } = [];
    public List<Tag> Tags { get; set; } = [];
    public List<SavedView> SavedViews { get; set; } = [];
    public List<Goal> Goals { get; set; } = [];
}
