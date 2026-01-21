using Microsoft.EntityFrameworkCore;
using MonkeyTypeStats.Api.Data;
using MonkeyTypeStats.Api.MonkeyTypeIntegration;

namespace MonkeyTypeStats.Api.Features.Results.Import;

public class ImportResultsJob
{
    private readonly MonkeyTypeApiClient _monkeyTypeApiClient;
    private readonly MonkeyTypeStatsDbContext _dbContext;
    private readonly ILogger<ImportResultsJob> _logger;

    public ImportResultsJob(
        MonkeyTypeApiClient monkeyTypeApiClient,
        MonkeyTypeStatsDbContext dbContext,
        ILogger<ImportResultsJob> logger
    )
    {
        _monkeyTypeApiClient = monkeyTypeApiClient;
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Starting daily MonkeyType results import job");

        try
        {
            var response = await _monkeyTypeApiClient.GetResultsAsync();

            var responseLog = new MonkeyTypeApiResponseLog
            {
                Id = Guid.NewGuid(),
                Timestamp = DateTime.UtcNow,
                Endpoint = "/results",
                Data = response.RawResponse,
            };

            _dbContext.MonkeyTypeApiResponseLog.Add(responseLog);

            var resultsData = response.ParsedResponse.Data;
            if (resultsData is null || resultsData.Count == 0)
            {
                _logger.LogInformation("No results data in API response");
                await _dbContext.SaveChangesAsync();
                return;
            }

            // Get existing result IDs to avoid duplicates
            var newResultIds = resultsData.Select(r => r.Id).ToList();
            var existingResultIds = await _dbContext
                .Results.Where(r => newResultIds.Contains(r.Id))
                .Select(r => r.Id)
                .ToListAsync();

            // Filter out already existing results
            var newResults = resultsData
                .Where(r => !existingResultIds.Contains(r.Id))
                .Select(r => new Result
                {
                    Id = r.Id,
                    Wpm = r.Wpm,
                    RawWpm = r.RawWpm,
                    CharStats = r.CharStats,
                    Acc = r.Acc,
                    Mode = r.Mode,
                    Mode2 = r.Mode2,
                    QuoteLength = r.QuoteLength,
                    Timestamp = DateTimeOffset.FromUnixTimeMilliseconds(r.Timestamp).UtcDateTime,
                    TestDuration = r.TestDuration,
                    Consistency = r.Consistency,
                    KeyConsistency = r.KeyConsistency,
                    Uid = r.Uid,
                    RestartCount = r.RestartCount,
                    IncompleteTestSeconds = r.IncompleteTestSeconds,
                    AfkDuration = r.AfkDuration,
                    Tags = r.Tags,
                    BailedOut = r.BailedOut,
                    BlindMode = r.BlindMode,
                    LazyMode = r.LazyMode,
                    Funbox = r.Funbox,
                    Language = r.Language,
                    Difficulty = r.Difficulty,
                    Numbers = r.Numbers,
                    Punctuation = r.Punctuation,
                    IsPb = r.IsPb,
                })
                .ToList();

            if (newResults.Count > 0)
            {
                _dbContext.Results.AddRange(newResults);
                _logger.LogInformation("Adding {Count} new results to database", newResults.Count);
            }
            else
            {
                _logger.LogInformation("No new results to import");
            }

            await _dbContext.SaveChangesAsync();

            _logger.LogInformation(
                "Successfully imported MonkeyType results. ResponseLog ID: {LogId}, New results: {NewCount}, Skipped duplicates: {SkippedCount}",
                responseLog.Id,
                newResults.Count,
                existingResultIds.Count
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to import MonkeyType results");
            throw;
        }
    }
}
