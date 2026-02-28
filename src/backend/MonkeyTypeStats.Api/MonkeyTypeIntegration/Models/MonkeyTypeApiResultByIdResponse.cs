namespace MonkeyTypeStats.Api.MonkeyTypeIntegration.Models;

public record MonkeyTypeApiResultByIdResponse
{
    public required string RawResponse { get; set; }
    public MonkeyTypeApiResponse<TestResultDetails>? ParsedResponse { get; set; }
}
