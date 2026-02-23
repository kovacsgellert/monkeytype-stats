using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using MonkeyTypeStats.Api.Common;
using MonkeyTypeStats.Api.Data;
using MonkeyTypeStats.Api.Features.Settings.Backup;

namespace MonkeyTypeStats.Api.Features.Settings.RestoreBackup;

public class RestoreBackupCommandHandler(MonkeyTypeStatsDbContext dbContext)
    : IRequestHandler<RestoreBackupCommand, OperationResult<RestoreBackupResult>>
{
    private static readonly JsonSerializerOptions jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public async Task<OperationResult<RestoreBackupResult>> Handle(
        RestoreBackupCommand request,
        CancellationToken cancellationToken
    )
    {
        if (string.IsNullOrWhiteSpace(request.BackupJson))
        {
            return OperationResult<RestoreBackupResult>.Error("Backup content is required.");
        }

        BackupSnapshot? backup;
        try
        {
            backup = JsonSerializer.Deserialize<BackupSnapshot>(request.BackupJson, jsonOptions);
        }
        catch (JsonException)
        {
            return OperationResult<RestoreBackupResult>.Error("Backup content is not valid JSON.");
        }

        if (backup is null)
        {
            return OperationResult<RestoreBackupResult>.Error("Backup content is invalid.");
        }

        var resultsToAdd = backup.Results ?? [];
        var resultDetailsToAdd = backup.ResultDetails ?? [];
        var responseLogsToAdd = backup.MonkeyTypeApiResponseLog ?? [];

        var distinctResults = resultsToAdd
            .GroupBy(result => result.Id)
            .Select(group => group.First())
            .ToList();
        var distinctResultDetails = resultDetailsToAdd
            .GroupBy(result => result.Id)
            .Select(group => group.First())
            .ToList();
        var distinctResponseLogs = responseLogsToAdd
            .GroupBy(log => log.Id)
            .Select(group => group.First())
            .ToList();

        var resultIds = distinctResults.Select(result => result.Id).ToList();
        var resultDetailIds = distinctResultDetails.Select(result => result.Id).ToList();
        var responseLogIds = distinctResponseLogs.Select(log => log.Id).ToList();

        var existingResultIds =
            resultIds.Count == 0
                ? []
                : await dbContext
                    .Results.AsNoTracking()
                    .Where(result => resultIds.Contains(result.Id))
                    .Select(result => result.Id)
                    .ToListAsync(cancellationToken);

        var existingResultIdSet = existingResultIds.ToHashSet();
        var newResults = distinctResults
            .Where(result => !existingResultIdSet.Contains(result.Id))
            .ToList();

        var existingResultDetailIds =
            resultDetailIds.Count == 0
                ? []
                : await dbContext
                    .ResultDetails.AsNoTracking()
                    .Where(result => resultDetailIds.Contains(result.Id))
                    .Select(result => result.Id)
                    .ToListAsync(cancellationToken);

        var existingResultDetailIdSet = existingResultDetailIds.ToHashSet();
        var newResultDetails = distinctResultDetails
            .Where(result => !existingResultDetailIdSet.Contains(result.Id))
            .ToList();

        var existingResponseLogIds =
            responseLogIds.Count == 0
                ? []
                : await dbContext
                    .MonkeyTypeApiResponseLog.AsNoTracking()
                    .Where(log => responseLogIds.Contains(log.Id))
                    .Select(log => log.Id)
                    .ToListAsync(cancellationToken);

        var existingResponseLogIdSet = existingResponseLogIds.ToHashSet();
        var newResponseLogs = distinctResponseLogs
            .Where(log => !existingResponseLogIdSet.Contains(log.Id))
            .ToList();

        if (newResults.Count > 0)
        {
            dbContext.Results.AddRange(newResults);
        }

        if (newResultDetails.Count > 0)
        {
            dbContext.ResultDetails.AddRange(newResultDetails);
        }

        if (newResponseLogs.Count > 0)
        {
            dbContext.MonkeyTypeApiResponseLog.AddRange(newResponseLogs);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return OperationResult<RestoreBackupResult>.Ok(
            new RestoreBackupResult(
                newResults.Count,
                distinctResults.Count - newResults.Count,
                newResultDetails.Count,
                distinctResultDetails.Count - newResultDetails.Count,
                newResponseLogs.Count,
                distinctResponseLogs.Count - newResponseLogs.Count
            )
        );
    }
}
