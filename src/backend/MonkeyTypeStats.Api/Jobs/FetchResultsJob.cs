using MonkeyTypeStats.Api.MonkeyTypeIntegration;
using MonkeyTypeStats.Api.Services;

namespace MonkeyTypeStats.Api.Jobs;

public class FetchResultsJob
{
    private readonly MonkeyTypeApiClient _monkeyTypeApiClient;
    private readonly ResultsFileService _resultsFileService;
    private readonly ILogger<FetchResultsJob> _logger;

    public FetchResultsJob(
        MonkeyTypeApiClient monkeyTypeApiClient,
        ResultsFileService resultsFileService,
        ILogger<FetchResultsJob> logger
    )
    {
        _monkeyTypeApiClient = monkeyTypeApiClient;
        _resultsFileService = resultsFileService;
        _logger = logger;
    }

    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Starting daily MonkeyType results fetch job");

        try
        {
            var results = await _monkeyTypeApiClient.GetResultsAsync();
            await _resultsFileService.SaveResultsAsync(results.RawResponse);

            _logger.LogInformation("Successfully fetched and saved MonkeyType results");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch and save MonkeyType results");
            throw;
        }
    }
}
