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

    public MonkeyTypeApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<GetResultsResponse> GetResultsAsync()
    {
        var response = await _httpClient.GetAsync("/results");
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var result =
            JsonSerializer.Deserialize<GetResultsResponse>(content, jsonOptions)
            ?? new GetResultsResponse();
        return result;
    }
}
