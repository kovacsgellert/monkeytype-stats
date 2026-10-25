namespace MonkeyTypeStats.Api.Data;

public class SpeedHistogramSnapshot
{
    public Guid Id { get; set; }
    public DateTime CapturedAt { get; set; }
    public string Language { get; set; } = string.Empty;
    public string Mode { get; set; } = string.Empty;
    public string Mode2 { get; set; } = string.Empty;

    // JSON object mapping 10-WPM bucket floors (and "Other") to user counts
    public string Buckets { get; set; } = "{}";
}
