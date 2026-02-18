using Microsoft.EntityFrameworkCore;
using MonkeyTypeStats.Api.Data;
using MonkeyTypeStats.Api.Features.Results;
using MonkeyTypeStats.Api.MonkeyTypeIntegration;

namespace MonkeyTypeStats.Api.Features.Results.Import;

public class ImportResultDetailsJob
{
    private const int MaxApiCallsPerRun = 50;

    private readonly MonkeyTypeApiClient _monkeyTypeApiClient;
    private readonly MonkeyTypeStatsDbContext _dbContext;
    private readonly ILogger<ImportResultDetailsJob> _logger;

    public ImportResultDetailsJob(
        MonkeyTypeApiClient monkeyTypeApiClient,
        MonkeyTypeStatsDbContext dbContext,
        ILogger<ImportResultDetailsJob> logger
    )
    {
        _monkeyTypeApiClient = monkeyTypeApiClient;
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Starting hourly MonkeyType result details import job");

        try
        {
            var resultsToImport = await _dbContext
                .Results.GroupJoin(
                    _dbContext.ResultDetails,
                    result => result.Id,
                    detail => detail.Id,
                    (result, details) => new { Result = result, Details = details }
                )
                .Where(entry => !entry.Details.Any())
                .OrderBy(entry => entry.Result.Timestamp)
                .Select(entry => entry.Result)
                .Take(MaxApiCallsPerRun)
                .ToListAsync();

            if (resultsToImport.Count == 0)
            {
                _logger.LogInformation("No result details to import");
                return;
            }

            foreach (var result in resultsToImport)
            {
                var response = await _monkeyTypeApiClient.GetResultByIdAsync(result.Id);

                var responseLog = new MonkeyTypeApiResponseLog
                {
                    Id = Guid.NewGuid(),
                    Timestamp = DateTime.UtcNow,
                    Endpoint = $"/results/id/{result.Id}",
                    Data = response.RawResponse,
                };

                _dbContext.MonkeyTypeApiResponseLog.Add(responseLog);

                var details = response.ParsedResponse.Data;
                if (details is null)
                {
                    _logger.LogWarning(
                        "Result details response had no data for result id {ResultId}",
                        result.Id
                    );
                    continue;
                }

                if (await _dbContext.ResultDetails.AnyAsync(rd => rd.Id == details.Id))
                {
                    _logger.LogInformation(
                        "Result details already exist for result id {ResultId}",
                        details.Id
                    );
                    continue;
                }

                var resultDetail = details.ToResultDetailEntity();

                _dbContext.ResultDetails.Add(resultDetail);
            }

            await _dbContext.SaveChangesAsync();

            _logger.LogInformation(
                "Successfully imported result details for {Count} results",
                resultsToImport.Count
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to import MonkeyType result details");
            throw;
        }
    }
}
