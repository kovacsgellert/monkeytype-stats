using MonkeyTypeStats.Api.Data;

namespace MonkeyTypeStats.Api.Features.Backup.Common;

public sealed class BackupSnapshot
{
    public string AppVersion { get; set; } = "0.0.0";
    public List<Result> Results { get; set; } = [];
    public List<ResultDetail> ResultDetails { get; set; } = [];
    public List<MonkeyTypeApiResponseLog> MonkeyTypeApiResponseLog { get; set; } = [];
}
