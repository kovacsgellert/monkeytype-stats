using MonkeyTypeStats.Api.MonkeyTypeIntegration;
using MonkeyTypeStats.Api.Services;

namespace MonkeyTypeStats.Api.Features.Results.Import;

public class ImportResultsJob
{
    private readonly MonkeyTypeApiClient _monkeyTypeApiClient;
    private readonly ResultsFileService _resultsFileService;
    private readonly ILogger<ImportResultsJob> _logger;

    public ImportResultsJob(
        MonkeyTypeApiClient monkeyTypeApiClient,
        ResultsFileService resultsFileService,
        ILogger<ImportResultsJob> logger
    )
    {
        _monkeyTypeApiClient = monkeyTypeApiClient;
        _resultsFileService = resultsFileService;
        _logger = logger;
    }

    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Starting daily MonkeyType results import job");

        try
        {
            var results = await _monkeyTypeApiClient.GetResultsAsync();
            await _resultsFileService.SaveResultsAsync(results.RawResponse);

            _logger.LogInformation("Successfully imported MonkeyType results");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to import MonkeyType results");
            throw;
        }
    }
}
