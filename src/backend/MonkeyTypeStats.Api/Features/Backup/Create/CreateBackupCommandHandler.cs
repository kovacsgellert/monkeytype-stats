using System.Text;
using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Data;
using MonkeyTypeStats.Api.Features.Backup.Common;
using MonkeyTypeStats.Api.Services;

namespace MonkeyTypeStats.Api.Features.Backup.Create;

public class CreateBackupCommandHandler(
    MonkeyTypeStatsDbContext dbContext,
    AppVersionProvider appVersionProvider
) : IRequestHandler<CreateBackupCommand, OperationResult<BackupFileResult>>
{
    private static readonly JsonSerializerOptions jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public async Task<OperationResult<BackupFileResult>> Handle(
        CreateBackupCommand request,
        CancellationToken cancellationToken
    )
    {
        var backup = new BackupSnapshot
        {
            AppVersion = appVersionProvider.GetVersion(),
            Results = await dbContext.Results.AsNoTracking().ToListAsync(cancellationToken),
            ResultDetails = await dbContext
                .ResultDetails.AsNoTracking()
                .ToListAsync(cancellationToken),
            MonkeyTypeApiResponseLog = await dbContext
                .MonkeyTypeApiResponseLog.AsNoTracking()
                .ToListAsync(cancellationToken),
        };

        var json = JsonSerializer.Serialize(backup, jsonOptions);
        var content = Encoding.UTF8.GetBytes(json);
        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd-HHmmss");
        var fileName = $"monkeytype-stats-backup-{timestamp}.json";

        return OperationResult<BackupFileResult>.Ok(new BackupFileResult(fileName, content));
    }
}
