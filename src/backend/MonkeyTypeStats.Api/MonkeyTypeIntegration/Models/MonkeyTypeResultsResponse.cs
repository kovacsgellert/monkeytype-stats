namespace MonkeyTypeStats.Api.MonkeyTypeIntegration.Models;

public record MonkeyTypeResultsResponse
{
    public required string RawResponse { get; set; }
    public required MonkeyTypeApiResponse<List<TestResult>> ParsedResponse { get; set; }
}
