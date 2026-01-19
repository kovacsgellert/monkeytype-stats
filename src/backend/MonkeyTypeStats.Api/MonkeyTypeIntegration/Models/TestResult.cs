using System.Text.Json.Serialization;

namespace MonkeyTypeStats.Api.MonkeyTypeIntegration.Models;

public record TestResult
{
    public double Wpm { get; set; }
    public double RawWpm { get; set; }
    public int[] CharStats { get; set; } = [];
    public double Acc { get; set; }
    public string Mode { get; set; } = string.Empty;
    public string Mode2 { get; set; } = string.Empty;
    public int QuoteLength { get; set; }
    public long Timestamp { get; set; }
    public double TestDuration { get; set; }
    public double Consistency { get; set; }
    public double KeyConsistency { get; set; }
    public string Uid { get; set; } = string.Empty;
    public int RestartCount { get; set; }
    public double IncompleteTestSeconds { get; set; }
    public double AfkDuration { get; set; }
    public string[] Tags { get; set; } = [];
    public bool BailedOut { get; set; }
    public bool BlindMode { get; set; }
    public bool LazyMode { get; set; }
    public string[] Funbox { get; set; } = [];
    public string Language { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;
    public bool Numbers { get; set; }
    public bool Punctuation { get; set; }

    [JsonPropertyName("_id")]
    public string Id { get; set; } = string.Empty;
    public bool IsPb { get; set; }
}
