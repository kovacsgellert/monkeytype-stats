namespace MonkeyTypeStats.Api.MonkeyTypeIntegration.Models;

public record ChartData
{
    public double[]? Wpm { get; set; }
    public double[]? Burst { get; set; }
    public double[]? Err { get; set; }
}
