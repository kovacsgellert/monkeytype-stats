namespace MonkeyTypeStats.Api.Data;

public class PersonalBest
{
    public Guid Id { get; set; }
    public string Mode { get; set; } = string.Empty;
    public string Mode2 { get; set; } = string.Empty;
    public string? Language { get; set; }
    public string? Difficulty { get; set; }
    public bool? Punctuation { get; set; }
    public bool? Numbers { get; set; }
    public bool? LazyMode { get; set; }
    public double Wpm { get; set; }
    public double? Raw { get; set; }
    public double? Acc { get; set; }
    public double? Consistency { get; set; }
    public DateTime Timestamp { get; set; }
    public DateTime ImportedAt { get; set; }
}
