namespace MonkeyTypeStats.Api.Data;

public class MonkeyTypeApiResponseLog
{
    public Guid Id { get; set; }
    public DateTime Timestamp { get; set; }
    public string Endpoint { get; set; } = string.Empty;
    public string Data { get; set; } = string.Empty;
}
