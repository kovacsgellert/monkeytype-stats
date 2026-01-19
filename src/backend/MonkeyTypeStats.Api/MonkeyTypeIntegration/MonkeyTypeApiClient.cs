using System.Text.Json;
using MonkeyTypeStats.Api.MonkeyTypeIntegration.Models;

namespace MonkeyTypeStats.Api.MonkeyTypeIntegration;

public class MonkeyTypeApiClient
{
    private static readonly JsonSerializerOptions jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    private readonly HttpClient _httpClient;
    private readonly ILogger<MonkeyTypeApiClient> _logger;

    public MonkeyTypeApiClient(HttpClient httpClient, ILogger<MonkeyTypeApiClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<MonkeyTypeResultsResponse> GetResultsAsync()
    {
        var response = await _httpClient.GetAsync("/results");

        if (!response.IsSuccessStatusCode)
        {
            await HandleErrorResponse(response, "/results");
        }

        var content = await response.Content.ReadAsStringAsync();
        var parsedResponse =
            JsonSerializer.Deserialize<MonkeyTypeApiResponse<List<TestResult>>>(
                content,
                jsonOptions
            )
            ?? throw new InvalidOperationException(
                "Failed to deserialize MonkeyType results response."
            );

        if (parsedResponse is null)
        {
            _logger.LogError($"Parsed MonkeyType results response is null. Raw content: {content}");
            throw new InvalidOperationException("Parsed MonkeyType results response is null.");
        }

        return new MonkeyTypeResultsResponse
        {
            RawResponse = content,
            ParsedResponse = parsedResponse,
        };
    }

    private async Task HandleErrorResponse(HttpResponseMessage response, string endpoint)
    {
        var content = string.Empty;
        try
        {
            content = await response.Content.ReadAsStringAsync();
        }
        catch { }

        _logger.LogError(
            $"Failed to fetch MonkeyType results from {endpoint}. Status code: {response.StatusCode}. Response content: {content}"
        );

        throw new InvalidOperationException($"Failed to fetch MonkeyType results from {endpoint}.");
    }
}
