namespace MonkeyTypeStats.Api.MonkeyTypeIntegration.Models;

public record TestResultDetails : TestResult
{
    public ChartData? ChartData { get; set; }
    public KeyStats? KeySpacingStats { get; set; }
    public KeyStats? KeyDurationStats { get; set; }
    public string? Name { get; set; }
}
