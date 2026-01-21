using System.Text.Json;
using MonkeyTypeStats.Api.MonkeyTypeIntegration.Models;

namespace MonkeyTypeStats.Api.Services;

public class ResultsFileService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        WriteIndented = true,
    };

    private readonly string _resultsDirectory;
    private readonly ILogger<ResultsFileService> _logger;

    public ResultsFileService(IConfiguration configuration, ILogger<ResultsFileService> logger)
    {
        _resultsDirectory = configuration.GetValue<string>("ResultsDirectory") ?? "results";
        _logger = logger;

        if (!Directory.Exists(_resultsDirectory))
        {
            Directory.CreateDirectory(_resultsDirectory);
        }
    }

    public async Task SaveResultsAsync(string rawResponse)
    {
        var fileName = $"results_{DateTime.UtcNow:yyyy-MM-dd}.json";
        var filePath = Path.Combine(_resultsDirectory, fileName);

        await File.WriteAllTextAsync(filePath, rawResponse);
        _logger.LogInformation("Saved results to {FilePath}", filePath);
    }

    public async Task<MonkeyTypeResultsResponse?> GetLatestResultsAsync()
    {
        var files = Directory
            .GetFiles(_resultsDirectory, "results_*.json")
            .OrderByDescending(f => f)
            .ToList();

        if (files.Count == 0)
        {
            _logger.LogWarning("No results files found in {Directory}", _resultsDirectory);
            return null;
        }

        var latestFile = files.First();
        _logger.LogInformation("Reading results from {FilePath}", latestFile);

        var content = await File.ReadAllTextAsync(latestFile);
        var parsedResponse = JsonSerializer.Deserialize<MonkeyTypeApiResponse<List<TestResult>>>(
            content,
            JsonOptions
        );

        if (parsedResponse is null)
        {
            _logger.LogError("Failed to deserialize results from {FilePath}", latestFile);
            return null;
        }

        return new MonkeyTypeResultsResponse
        {
            RawResponse = content,
            ParsedResponse = parsedResponse,
        };
    }
}
