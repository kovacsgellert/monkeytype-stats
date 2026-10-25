namespace MonkeyTypeStats.Api.MonkeyTypeIntegration.Models;

public record MonkeyTypeApiCallResult<T>
{
    public required string Endpoint { get; set; }
    public required string RawResponse { get; set; }
    public required MonkeyTypeApiResponse<T> ParsedResponse { get; set; }
}
