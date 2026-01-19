namespace MonkeyTypeStats.Api.MonkeyTypeIntegration.Models;

public record MonkeyTypeApiResponse<T>
{
    public required string Message { get; set; }
    public T? Data { get; set; }
}
