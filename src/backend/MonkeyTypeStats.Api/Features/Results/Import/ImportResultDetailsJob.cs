using System.Net;
using Microsoft.EntityFrameworkCore;
using MonkeyTypeStats.Api.Data;
using MonkeyTypeStats.Api.Features.Results;
using MonkeyTypeStats.Api.MonkeyTypeIntegration;
using MonkeyTypeStats.Api.MonkeyTypeIntegration.Models;

namespace MonkeyTypeStats.Api.Features.Results.Import;

public class ImportResultDetailsJob
{
    private const int MaxApiCallsPerRun = 20;
    private const string ResultEndpointPrefix = "/results/id/";

    private readonly MonkeyTypeApiClient _monkeyTypeApiClient;
    private readonly MonkeyTypeApiResponseLogger _responseLogger;
    private readonly MonkeyTypeStatsDbContext _dbContext;
    private readonly ILogger<ImportResultDetailsJob> _logger;

    public ImportResultDetailsJob(
        MonkeyTypeApiClient monkeyTypeApiClient,
        MonkeyTypeApiResponseLogger responseLogger,
        MonkeyTypeStatsDbContext dbContext,
        ILogger<ImportResultDetailsJob> logger
    )
    {
        _monkeyTypeApiClient = monkeyTypeApiClient;
        _responseLogger = responseLogger;
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Starting hourly MonkeyType result details import job");

        try
        {
            // results that were already attempted have a response log entry (even a 404 one),
            // so they are filtered out here instead of blocking the oldest-first batch forever
            var resultsToImport = await _dbContext
                .Results.Where(result => !_dbContext.ResultDetails.Any(d => d.Id == result.Id))
                .Where(result =>
                    !_dbContext.MonkeyTypeApiResponseLog.Any(log =>
                        log.Endpoint == ResultEndpointPrefix + result.Id
                    )
                )
                .OrderBy(result => result.Timestamp)
                .Select(result => result.Id)
                .Take(MaxApiCallsPerRun)
                .ToListAsync();

            if (resultsToImport.Count == 0)
            {
                _logger.LogInformation("No result details to import");
                return;
            }

            var importedCount = 0;
            foreach (var resultId in resultsToImport)
            {
                if (await ImportResultDetailAsync(resultId))
                    importedCount++;

                // save after every result, so a later failure does not lose earlier progress
                await _dbContext.SaveChangesAsync();
            }

            _logger.LogInformation(
                "Imported result details for {ImportedCount} of {AttemptedCount} results",
                importedCount,
                resultsToImport.Count
            );
        }
        catch (HttpRequestException ex) when (ex.StatusCode == (HttpStatusCode)479)
        {
            _logger.LogError(
                ex,
                "MonkeyType API rate limit exceeded (status code 479). Stopping result details import job."
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to import MonkeyType result details");
            throw;
        }
    }

    private async Task<bool> ImportResultDetailAsync(string resultId)
    {
        MonkeyTypeApiResultByIdResponse response;
        try
        {
            response = await _monkeyTypeApiClient.GetResultByIdAsync(resultId);
        }
        catch (MonkeyTypeApiException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            // MonkeyType deletes old results; log the 404 so this result is not retried
            _logger.LogInformation(
                "Result details for result id {ResultId} no longer exist on MonkeyType",
                resultId
            );
            await _responseLogger.AddErrorIfChangedAsync(ex);
            return false;
        }
        catch (MonkeyTypeApiException ex) when (ex.StatusCode != (HttpStatusCode)479)
        {
            // not logged, so it is retried next run, but it does not stop the other results
            _logger.LogWarning(
                ex,
                "Failed to fetch result details for result id {ResultId}",
                resultId
            );
            return false;
        }

        await _responseLogger.AddIfChangedAsync(
            ResultEndpointPrefix + resultId,
            response.RawResponse
        );

        var details = response.ParsedResponse.Data;
        if (details is null)
        {
            _logger.LogWarning(
                "Result details response had no data for result id {ResultId}",
                resultId
            );
            return false;
        }

        if (await _dbContext.ResultDetails.AnyAsync(rd => rd.Id == details.Id))
        {
            _logger.LogInformation(
                "Result details already exist for result id {ResultId}",
                details.Id
            );
            return false;
        }

        _dbContext.ResultDetails.Add(details.ToResultDetailEntity());
        return true;
    }
}
