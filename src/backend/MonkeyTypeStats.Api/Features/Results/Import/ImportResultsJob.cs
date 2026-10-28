using System.Net;
using Microsoft.EntityFrameworkCore;
using MonkeyTypeStats.Api.Data;
using MonkeyTypeStats.Api.MonkeyTypeIntegration;

namespace MonkeyTypeStats.Api.Features.Results.Import;

public class ImportResultsJob
{
    public const HttpStatusCode RateLimitedStatusCode = (HttpStatusCode)479;

    private readonly MonkeyTypeApiClient _monkeyTypeApiClient;
    private readonly MonkeyTypeApiResponseLogger _responseLogger;
    private readonly MonkeyTypeStatsDbContext _dbContext;
    private readonly ILogger<ImportResultsJob> _logger;

    public ImportResultsJob(
        MonkeyTypeApiClient monkeyTypeApiClient,
        MonkeyTypeApiResponseLogger responseLogger,
        MonkeyTypeStatsDbContext dbContext,
        ILogger<ImportResultsJob> logger
    )
    {
        _monkeyTypeApiClient = monkeyTypeApiClient;
        _responseLogger = responseLogger;
        _dbContext = dbContext;
        _logger = logger;
    }

    /// <summary>Entry point for the recurring job: a MonkeyType rate limit is logged, not thrown.</summary>
    public async Task ExecuteAsync()
    {
        try
        {
            await ExecuteWithResultAsync();
        }
        catch (HttpRequestException ex) when (ex.StatusCode == RateLimitedStatusCode)
        {
            _logger.LogError(
                ex,
                "MonkeyType API rate limit exceeded (status code 479). Stopping results import job."
            );
        }
    }

    /// <summary>
    /// Imports new results and returns how many were added. A MonkeyType rate limit is thrown
    /// as an <see cref="HttpRequestException"/> with status code 479, so callers can report it.
    /// </summary>
    public async Task<int> ExecuteWithResultAsync()
    {
        _logger.LogInformation("Starting daily MonkeyType results import job");

        try
        {
            var response = await _monkeyTypeApiClient.GetResultsAsync();

            var resultsData = response.ParsedResponse.Data;
            if (resultsData is null || resultsData.Count == 0)
            {
                _logger.LogInformation("No results data in API response");
                await _dbContext.SaveChangesAsync();
                return 0;
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
                .Select(r => r.ToResultEntity())
                .ToList();

            if (newResults.Count == 0)
            {
                _logger.LogInformation("No new results to import");
                return 0;
            }

            _logger.LogInformation("Adding {Count} new results to database", newResults.Count);

            // only responses that bring new results are worth keeping in the history
            await _responseLogger.AddIfChangedAsync("/results", response.RawResponse);
            _dbContext.Results.AddRange(newResults);
            await _dbContext.SaveChangesAsync();

            _logger.LogInformation(
                "Successfully imported MonkeyType results. New results: {NewCount}, Skipped duplicates: {SkippedCount}",
                newResults.Count,
                existingResultIds.Count
            );

            return newResults.Count;
        }
        catch (Exception ex)
            when (ex is not HttpRequestException { StatusCode: RateLimitedStatusCode })
        {
            _logger.LogError(ex, "Failed to import MonkeyType results");
            throw;
        }
    }
}
