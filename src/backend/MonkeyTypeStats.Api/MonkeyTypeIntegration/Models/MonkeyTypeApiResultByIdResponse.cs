namespace MonkeyTypeStats.Api.MonkeyTypeIntegration.Models;

public record MonkeyTypeApiResultByIdResponse
{
    public required string RawResponse { get; set; }
    public required MonkeyTypeApiResponse<TestResultDetails> ParsedResponse { get; set; }
}
