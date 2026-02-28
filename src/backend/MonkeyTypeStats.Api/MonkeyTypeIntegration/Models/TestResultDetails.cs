using System.Text.Json.Serialization;

namespace MonkeyTypeStats.Api.MonkeyTypeIntegration.Models;

public record TestResultDetails : TestResult
{
    [JsonConverter(typeof(ChartDataJsonConverter))]
    public ChartData? ChartData { get; set; }
    public KeyStats? KeySpacingStats { get; set; }
    public KeyStats? KeyDurationStats { get; set; }
    public string? Name { get; set; }
}
